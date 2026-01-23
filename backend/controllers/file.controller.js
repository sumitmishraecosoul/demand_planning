const File = require('../models/File.model');
const Workflow = require('../models/Workflow.model');
const Level = require('../models/Level.model');
const path = require('path');
const fs = require('fs');

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

    // Get first level of department
    const firstLevel = await Level.findOne({ 
      department, 
      levelNumber: 1,
      isActive: true 
    }).populate('defaultHandler');

    if (!firstLevel) {
      return res.status(400).json({ 
        success: false, 
        message: 'No levels configured for this department. Please contact admin.' 
      });
    }

    // Normalize MIME type based on file extension
    const normalizedMimeType = normalizeMimeType(req.file.originalname, req.file.mimetype);

    // Create file record
    const file = await File.create({
      title,
      description,
      channel,
      demandType,
      month,
      year: year ? parseInt(year) : undefined,
      department,
      currentLevel: firstLevel._id,
      currentHandler: firstLevel.defaultHandler._id,
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
        level: firstLevel._id,
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
      filter.currentHandler = req.user._id;
    }

    const files = await File.find(filter)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber')
      .populate('currentHandler', 'name email designation level')
      .populate('createdBy', 'name email')
      .populate('versions.uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      files
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
