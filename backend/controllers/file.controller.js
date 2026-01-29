const File = require('../models/File.model');
const Workflow = require('../models/Workflow.model');
const Level = require('../models/Level.model');
const path = require('path');
const fs = require('fs');
const emailService = require('../services/email.service');

// Helper function to normalize MIME type based on file extension
const normalizeMimeType = (filename, originalMimetype) => {
  const ext = path.extname(filename).toLowerCase();
  
  // Map file extensions to correct MIME types
  const mimeTypes = {
    '.csv': 'text/csv',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.pdf': 'application/pdf'
  };
  
  // Return the correct MIME type based on extension, or use original if not found
  return mimeTypes[ext] || originalMimetype;
};

// Upload file
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded.' 
      });
    }

    const { title, description, channel, demandType, month, year, department, signature, comments } = req.body;

    // Determine the uploader's level in this department
    let uploaderLevelId;
    let uploaderLevelNumber;

    if (req.user.role === 'director') {
      // For directors, find their level assignment in this department
      const User = require('../models/User.model');
      const userWithAssignments = await User.findById(req.user._id).populate('departmentAssignments.level');
      
      const assignment = userWithAssignments.departmentAssignments.find(
        a => a.department.toString() === department.toString()
      );

      if (!assignment) {
        return res.status(400).json({ 
          success: false, 
          message: 'You are not assigned to any level in this department. Please contact admin.' 
        });
      }

      uploaderLevelId = assignment.level._id;
      uploaderLevelNumber = assignment.level.levelNumber;
    } else {
      // For regular users, use their level field
      uploaderLevelNumber = req.user.level;
      
      // Find the level document for this department and level number
      const userLevel = await Level.findOne({
        department,
        levelNumber: uploaderLevelNumber,
        isActive: true
      });

      if (!userLevel) {
        return res.status(400).json({ 
          success: false, 
          message: `No Level ${uploaderLevelNumber} configured for this department. Please contact admin.` 
        });
      }

      uploaderLevelId = userLevel._id;
    }

    // Get the level where file should start (uploader's level)
    const startingLevel = await Level.findById(uploaderLevelId).populate('handlers');

    if (!startingLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'Level not found for this department. Please contact admin.' 
      });
    }

    // Normalize MIME type based on file extension
    const normalizedMimeType = normalizeMimeType(req.file.originalname, req.file.mimetype);

    // Create file record - assign to uploader's level with uploader as handler
    const file = await File.create({
      title,
      description,
      channel,
      demandType,
      month,
      year: year ? parseInt(year) : undefined,
      department,
      currentLevel: startingLevel._id,
      currentHandler: req.user._id, // Uploader is the initial handler
      status: 'pending',
      createdBy: req.user._id,
      versions: [{
        versionNumber: 1,
        fileName: req.file.originalname,
        filePath: req.file.path,
        fileType: normalizedMimeType,
        fileSize: req.file.size,
        uploadedBy: req.user._id,
        signature,
        comments
      }],
      currentVersion: 1
    });

    // Create workflow
    const workflow = await Workflow.create({
      file: file._id,
      department,
      steps: [{
        level: startingLevel._id,
        handler: req.user._id,
        action: 'uploaded',
        signature,
        comments,
        fileVersion: 1
      }],
      currentStep: 0,
      status: 'active'
    });

    // Populate and return
    const populatedFile = await File.findById(file._id)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber')
      .populate('currentHandler', 'name email designation')
      .populate('createdBy', 'name email')
      .populate('versions.uploadedBy', 'name email');

    // Send email notification if handler is different from uploader
    if (req.user._id.toString() !== populatedFile.currentHandler._id.toString()) {
      try {
        const levelName = startingLevel.levelName || `Level ${startingLevel.levelNumber}`;
        await emailService.sendFileAssignedEmail(populatedFile.currentHandler, {
          fileTitle: file.title,
          department: populatedFile.department.name,
          level: levelName,
          assignedBy: req.user.name,
          fileId: file._id
        });
      } catch (emailError) {
        console.error('Error sending upload notification email:', emailError.message);
      }
    }

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully.',
      file: populatedFile,
      workflow
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error uploading file.', 
      error: error.message 
    });
  }
};

// Get files (with filters)
exports.getFiles = async (req, res) => {
  try {
    const { department, status, myFiles } = req.query;
    const Workflow = require('../models/Workflow.model');
    
    let filter = { isActive: true };

    // Admin can see all files
    if (req.user.role === 'admin') {
      if (department) filter.department = department;
    }
    // Director can see files from accessible departments
    else if (req.user.role === 'director') {
      filter.department = { 
        $in: req.user.accessibleDepartments.map(d => d._id) 
      };
      if (department) filter.department = department;
    }
    // Regular users can only see their department files
    else {
      filter.department = req.user.department._id;
    }

    // Filter by status
    if (status) filter.status = status;

    // Filter by current handler (my files)
    if (myFiles === 'true') {
      // Find workflows where user is in assignedHandlers of the latest step
      const workflows = await Workflow.find({
        status: 'active'
      }).select('file steps');

      const fileIdsWithUser = workflows
        .filter(w => {
          const lastStep = w.steps[w.steps.length - 1];
          return lastStep && lastStep.assignedHandlers && 
                 lastStep.assignedHandlers.some(h => h.toString() === req.user._id.toString());
        })
        .map(w => w.file);

      // Include files where user is currentHandler OR in assignedHandlers
      filter.$or = [
        { currentHandler: req.user._id },
        { _id: { $in: fileIdsWithUser } }
      ];
    }

    const files = await File.find(filter)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber')
      .populate('currentHandler', 'name email designation level')
      .populate('createdBy', 'name email')
      .populate('versions.uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    // Auto-fix files with missing currentLevel/currentHandler
    const filesToFix = files.filter(f => !f.currentLevel || !f.currentHandler);
    if (filesToFix.length > 0) {
      for (const file of filesToFix) {
        try {
          const firstLevel = await Level.findOne({
            department: file.department._id,
            levelNumber: 1,
            isActive: true
          }).populate('handlers');

          if (firstLevel && firstLevel.handlers && firstLevel.handlers.length > 0) {
            await File.findByIdAndUpdate(file._id, {
              currentLevel: firstLevel._id,
              currentHandler: firstLevel.handlers[0]._id
            });
            // Update the file object for response
            file.currentLevel = firstLevel;
            file.currentHandler = firstLevel.handlers[0];
          }
        } catch (error) {
          console.error('Error auto-fixing file:', file._id, error);
        }
      }
    }

    // Enrich files with department levels and workflow history for timeline
    const enrichedFiles = await Promise.all(files.map(async (file) => {
      const fileObj = file.toObject();
      
      // Get all levels for this department
      const departmentLevels = await Level.find({
        department: file.department._id,
        isActive: true
      })
        .populate('handlers', 'name email designation')
        .sort({ levelNumber: 1 });

      // Get workflow history
      const workflow = await Workflow.findOne({ file: file._id })
        .populate('steps.level', 'levelName levelNumber')
        .populate('steps.handler', 'name email designation')
        .populate('steps.assignedHandlers', 'name email designation');

      fileObj.departmentLevels = departmentLevels;
      fileObj.workflowHistory = workflow;

      return fileObj;
    }));

    res.json({
      success: true,
      files: enrichedFiles
    });
  } catch (error) {
    console.error('Get files error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching files.', 
      error: error.message 
    });
  }
};

// Get single file
exports.getFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber nextLevel')
      .populate('currentHandler', 'name email designation level')
      .populate('createdBy', 'name email')
      .populate('versions.uploadedBy', 'name email designation');

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found.' 
      });
    }

    // Check access
    if (req.user.role === 'user' && 
        file.department._id.toString() !== req.user.department._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied.' 
      });
    }

    // Get all levels for this department (for workflow timeline)
    const departmentLevels = await Level.find({
      department: file.department._id,
      isActive: true
    })
      .populate('handlers', 'name email designation')
      .sort({ levelNumber: 1 });

    // Get workflow history for this file
    const workflow = await Workflow.findOne({ file: fileId })
      .populate('steps.level', 'levelName levelNumber')
      .populate('steps.handler', 'name email designation')
      .populate('steps.assignedHandlers', 'name email designation');

    file._doc.departmentLevels = departmentLevels;
    file._doc.workflowHistory = workflow;

    res.json({
      success: true,
      file
    });
  } catch (error) {
    console.error('Get file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching file.', 
      error: error.message 
    });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const { fileId, version } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found.' 
      });
    }

    // Check access
    if (req.user.role === 'user' && 
        file.department.toString() !== req.user.department._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied.' 
      });
    }

    // Get specific version or current version
    const versionNumber = version ? parseInt(version) : file.currentVersion;
    const fileVersion = file.versions.find(v => v.versionNumber === versionNumber);

    if (!fileVersion) {
      return res.status(404).json({ 
        success: false, 
        message: 'File version not found.' 
      });
    }

    const filePath = path.resolve(fileVersion.filePath);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found on server.' 
      });
    }

    res.download(filePath, fileVersion.fileName);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error downloading file.', 
      error: error.message 
    });
  }
};

// Update file (upload new version)
exports.updateFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded.' 
      });
    }

    const { fileId } = req.params;
    const { signature, comments } = req.body;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found.' 
      });
    }

    // Check if user is current handler
    if (file.currentHandler.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to update this file.' 
      });
    }

    // Add new version
    const newVersion = file.currentVersion + 1;
    const normalizedMimeType = normalizeMimeType(req.file.originalname, req.file.mimetype);
    
    file.versions.push({
      versionNumber: newVersion,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileType: normalizedMimeType,
      fileSize: req.file.size,
      uploadedBy: req.user._id,
      signature,
      comments
    });
    file.currentVersion = newVersion;

    await file.save();

    // Update workflow
    const workflow = await Workflow.findOne({ file: fileId, status: 'active' });
    if (workflow) {
      workflow.steps.push({
        level: file.currentLevel,
        handler: req.user._id,
        action: 'updated',
        signature,
        comments,
        fileVersion: newVersion
      });
      await workflow.save();
    }

    const populatedFile = await File.findById(file._id)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber')
      .populate('currentHandler', 'name email designation')
      .populate('createdBy', 'name email')
      .populate('versions.uploadedBy', 'name email');

    res.json({
      success: true,
      message: 'File updated successfully.',
      file: populatedFile
    });
  } catch (error) {
    console.error('Update file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating file.', 
      error: error.message 
    });
  }
};

// Delete file
exports.deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found.' 
      });
    }

    // Check authorization - only admin, director, or file creator can delete
    if (req.user.role !== 'admin' && 
        req.user.role !== 'director' && 
        file.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to delete this file.' 
      });
    }

    // Delete physical files
    file.versions.forEach(version => {
      const filePath = path.resolve(version.filePath);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    // Delete workflow
    await Workflow.deleteMany({ file: fileId });

    // Delete file record
    await File.findByIdAndDelete(fileId);

    res.json({
      success: true,
      message: 'File deleted successfully.'
    });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting file.', 
      error: error.message 
    });
  }
};
