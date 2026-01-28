const Workflow = require('../models/Workflow.model');
const File = require('../models/File.model');
const Level = require('../models/Level.model');
const User = require('../models/User.model');
const { createBulkNotifications } = require('./notification.controller');

// Pass file to next level
exports.passToNextLevel = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { nextHandler, signature, comments, action } = req.body;

    const file = await File.findById(fileId)
      .populate('currentLevel');

    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'File not found.' 
      });
    }

    // Get workflow first to check assigned handlers
    const workflow = await Workflow.findOne({ 
      file: fileId, 
      status: 'active' 
    });

    if (!workflow) {
      return res.status(404).json({ 
        success: false, 
        message: 'Workflow not found.' 
      });
    }

    // Check if user is current handler OR one of the assigned handlers
    const lastStep = workflow.steps[workflow.steps.length - 1];
    const assignedHandlers = lastStep?.assignedHandlers || [];
    const isCurrentHandler = file.currentHandler.toString() === req.user._id.toString();
    const isAssignedHandler = assignedHandlers.some(h => h.toString() === req.user._id.toString());
    
    if (!isCurrentHandler && !isAssignedHandler) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to pass this file.' 
      });
    }

    // Get next level
    const nextLevel = await Level.findById(file.currentLevel.nextLevel);

    if (!nextLevel) {
      // This is the last level - mark as completed
      file.status = 'completed';
      workflow.status = 'completed';
      workflow.completedAt = new Date();
      
      workflow.steps.push({
        level: file.currentLevel._id,
        handler: req.user._id,
        action: 'approved',
        signature,
        comments,
        fileVersion: file.currentVersion
      });

      await file.save();
      await workflow.save();

      return res.json({
        success: true,
        message: 'File approved and workflow completed.',
        file,
        workflow
      });
    }

    // Handle both single handler (string) and multiple handlers (array)
    const handlerIds = Array.isArray(nextHandler) ? nextHandler : [nextHandler];
    const primaryHandler = handlerIds[0];

    // Validate all handlers
    const handlers = await User.find({ _id: { $in: handlerIds } });
    if (handlers.length !== handlerIds.length) {
      return res.status(400).json({ 
        success: false, 
        message: 'One or more handlers not found.' 
      });
    }

    // Validate all handlers belong to same department
    const invalidHandlers = handlers.filter(
      h => h.department.toString() !== file.department.toString()
    );
    if (invalidHandlers.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'All handlers must be from the same department.' 
      });
    }

    // Update file - assign to primary handler
    file.currentLevel = nextLevel._id;
    file.currentHandler = primaryHandler;
    file.status = 'in-progress';

    // Add step to workflow with all assigned handlers
    workflow.steps.push({
      level: file.currentLevel._id,
      handler: req.user._id,
      assignedHandlers: handlerIds, // Store all assigned handlers
      action: action || 'passed',
      signature,
      comments,
      fileVersion: file.currentVersion
    });
    workflow.currentStep = workflow.steps.length - 1;

    await file.save();
    await workflow.save();

    const populatedFile = await File.findById(file._id)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber')
      .populate('currentHandler', 'name email designation')
      .populate('createdBy', 'name email')
      .populate('versions.uploadedBy', 'name email');

    // Create notifications for all assigned handlers
    try {
      const nextLevelName = nextLevel.levelName || `Level ${nextLevel.levelNumber}`;
      await createBulkNotifications(
        handlerIds,
        req.user._id,
        file._id,
        'assigned',
        'New File Assigned',
        `${req.user.name} has assigned "${file.title}" to you at ${nextLevelName}`,
        '/files/my-files'
      );
    } catch (notifError) {
      console.error('Error creating notifications:', notifError);
    }

    res.json({
      success: true,
      message: 'File passed to next level successfully.',
      file: populatedFile,
      workflow
    });
  } catch (error) {
    console.error('Pass to next level error:', error);
    res.status(500).json({
      success: false,
      message: 'Error passing file to next level.',
      error: error.message
    });
  }
};

// Reject file
exports.rejectFile = async (req, res) => {
  try {
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
        message: 'You are not authorized to reject this file.' 
      });
    }

    // Get workflow
    const workflow = await Workflow.findOne({ 
      file: fileId, 
      status: 'active' 
    });

    if (!workflow) {
      return res.status(404).json({ 
        success: false, 
        message: 'Workflow not found.' 
      });
    }

    // Update file and workflow
    file.status = 'rejected';
    workflow.status = 'rejected';
    workflow.completedAt = new Date();

    workflow.steps.push({
      level: file.currentLevel,
      handler: req.user._id,
      action: 'rejected',
      signature,
      comments,
      fileVersion: file.currentVersion
    });

    await file.save();
    await workflow.save();

    const populatedFile = await File.findById(file._id)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber')
      .populate('currentHandler', 'name email designation')
      .populate('createdBy', 'name email')
      .populate('versions.uploadedBy', 'name email');

    // Notify file creator about rejection
    try {
      await createBulkNotifications(
        [file.createdBy._id],
        req.user._id,
        file._id,
        'rejected',
        'File Rejected',
        `${req.user.name} has rejected "${file.title}". Reason: ${comments || 'No reason provided'}`,
        `/files/${file._id}`
      );
    } catch (notifError) {
      console.error('Error creating notifications:', notifError);
    }

    res.json({
      success: true,
      message: 'File rejected successfully.',
      file: populatedFile,
      workflow
    });
  } catch (error) {
    console.error('Reject file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting file.',
      error: error.message
    });
  }
};

// Get workflow for a file
exports.getWorkflow = async (req, res) => {
  try {
    const { fileId } = req.params;

    const workflow = await Workflow.findOne({ file: fileId })
      .populate('file', 'title description')
      .populate('department', 'name')
      .populate({
        path: 'steps.level',
        select: 'levelName levelNumber'
      })
      .populate({
        path: 'steps.handler',
        select: 'name email designation level'
      });

    if (!workflow) {
      return res.status(404).json({ 
        success: false, 
        message: 'Workflow not found.' 
      });
    }

    res.json({
      success: true,
      workflow
    });
  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching workflow.', 
      error: error.message 
    });
  }
};

// Get users in same department (for passing to next level)
exports.getDepartmentUsers = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const { excludeMe, currentLevelId } = req.query;

    // If currentLevelId is provided, get users at the NEXT level only
    if (currentLevelId) {
      const currentLevel = await Level.findById(currentLevelId);
      
      if (!currentLevel) {
        return res.status(404).json({
          success: false,
          message: 'Current level not found.'
        });
      }

      // Get the next level
      const nextLevel = await Level.findById(currentLevel.nextLevel)
        .populate('handlers', 'name email designation level role');

      if (!nextLevel) {
        // No next level - workflow ends here
        return res.json({
          success: true,
          users: [],
          message: 'This is the final level.'
        });
      }

      // Return handlers assigned to the next level
      // This includes both regular users and directors assigned to this level
      const handlers = nextLevel.handlers || [];
      
      // Also check for directors with department assignments at this level
      const directorsAtLevel = await User.find({
        role: 'director',
        isActive: true,
        'departmentAssignments.department': departmentId,
        'departmentAssignments.level': nextLevel._id
      }).select('name email designation level role');

      // Combine and deduplicate
      const allHandlers = [...handlers];
      directorsAtLevel.forEach(director => {
        if (!allHandlers.find(h => h._id.toString() === director._id.toString())) {
          allHandlers.push(director);
        }
      });

      return res.json({
        success: true,
        users: allHandlers,
        nextLevel: {
          id: nextLevel._id,
          name: nextLevel.levelName,
          number: nextLevel.levelNumber
        }
      });
    }

    // Fallback: Return all users in department (backward compatibility)
    const filter = { 
      department: departmentId, 
      role: 'user',
      isActive: true 
    };

    if (excludeMe === 'true') {
      filter._id = { $ne: req.user._id };
    }

    const users = await User.find(filter)
      .select('name email designation level')
      .sort({ level: 1, name: 1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get department users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching department users.', 
      error: error.message 
    });
  }
};

// Get users at the same level (excluding specified user)
exports.getSameLevelUsers = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { excludeUserId } = req.query;

    const level = await Level.findById(levelId)
      .populate('handlers', 'name email designation level role');

    if (!level) {
      return res.status(404).json({
        success: false,
        message: 'Level not found.'
      });
    }

    // Filter out the excluded user
    let sameLevelUsers = level.handlers || [];
    if (excludeUserId) {
      sameLevelUsers = sameLevelUsers.filter(
        handler => handler._id.toString() !== excludeUserId.toString()
      );
    }

    res.json({
      success: true,
      users: sameLevelUsers,
      level: {
        id: level._id,
        name: level.levelName,
        number: level.levelNumber
      }
    });
  } catch (error) {
    console.error('Get same level users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching same level users.',
      error: error.message
    });
  }
};

// Pass file to another handler at the same level
exports.passToSameLevel = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { nextHandler, signature, comments } = req.body;

    const file = await File.findById(fileId)
      .populate('currentLevel');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.'
      });
    }

    // Get workflow
    const workflow = await Workflow.findOne({
      file: fileId,
      status: 'active'
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.'
      });
    }

    // Check if user is current handler OR one of the assigned handlers
    const lastStep = workflow.steps[workflow.steps.length - 1];
    const assignedHandlers = lastStep?.assignedHandlers || [];
    const isCurrentHandler = file.currentHandler.toString() === req.user._id.toString();
    const isAssignedHandler = assignedHandlers.some(h => h.toString() === req.user._id.toString());

    if (!isCurrentHandler && !isAssignedHandler) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to pass this file.'
      });
    }

    // Handle both single handler (string) and multiple handlers (array)
    const handlerIds = Array.isArray(nextHandler) ? nextHandler : [nextHandler];
    const primaryHandler = handlerIds[0];

    // Validate all handlers
    const handlers = await User.find({ _id: { $in: handlerIds } });
    if (handlers.length !== handlerIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more handlers not found.'
      });
    }

    // Validate all handlers are at the same level
    const level = await Level.findById(file.currentLevel._id).populate('handlers');
    const levelHandlerIds = level.handlers.map(h => h._id.toString());
    
    const invalidHandlers = handlerIds.filter(
      hId => !levelHandlerIds.includes(hId.toString())
    );
    
    if (invalidHandlers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected handlers must be at the same level.'
      });
    }

    // Update file - assign to primary handler (same level)
    file.currentHandler = primaryHandler;
    file.status = 'in-progress';

    // Add step to workflow
    workflow.steps.push({
      level: file.currentLevel._id,
      handler: req.user._id,
      assignedHandlers: handlerIds,
      action: 'passed',
      signature,
      comments,
      fileVersion: file.currentVersion
    });

    await file.save();
    await workflow.save();

    const populatedFile = await File.findById(file._id)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber')
      .populate('currentHandler', 'name email designation')
      .populate('createdBy', 'name email');

    // Create notifications for assigned same-level handlers
    try {
      const levelName = level.levelName || `Level ${level.levelNumber}`;
      await createBulkNotifications(
        handlerIds,
        req.user._id,
        file._id,
        'assigned',
        'File Assigned for Review',
        `${req.user.name} has assigned "${file.title}" to you for review at ${levelName}`,
        '/files/my-files'
      );
    } catch (notifError) {
      console.error('Error creating notifications:', notifError);
    }

    res.json({
      success: true,
      message: 'File passed to same level handler successfully.',
      file: populatedFile,
      workflow
    });
  } catch (error) {
    console.error('Pass to same level error:', error);
    res.status(500).json({
      success: false,
      message: 'Error passing file to same level.',
      error: error.message
    });
  }
};

// Complete the workflow
exports.completeFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { signature, comments } = req.body;

    const file = await File.findById(fileId)
      .populate('currentLevel');

    if (!file) {
      return res.status(404).json({
        success: false,
        message: 'File not found.'
      });
    }

    // Get workflow
    const workflow = await Workflow.findOne({
      file: fileId,
      status: 'active'
    });

    if (!workflow) {
      return res.status(404).json({
        success: false,
        message: 'Workflow not found.'
      });
    }

    // Check if user is current handler OR one of the assigned handlers
    const lastStep = workflow.steps[workflow.steps.length - 1];
    const assignedHandlers = lastStep?.assignedHandlers || [];
    const isCurrentHandler = file.currentHandler.toString() === req.user._id.toString();
    const isAssignedHandler = assignedHandlers.some(h => h.toString() === req.user._id.toString());

    if (!isCurrentHandler && !isAssignedHandler) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to complete this file.'
      });
    }

    // Mark as completed
    file.status = 'completed';
    workflow.status = 'completed';
    workflow.completedAt = new Date();

    // Add final step to workflow
    workflow.steps.push({
      level: file.currentLevel._id,
      handler: req.user._id,
      action: 'approved',
      signature,
      comments,
      fileVersion: file.currentVersion
    });

    await file.save();
    await workflow.save();

    const populatedFile = await File.findById(file._id)
      .populate('department', 'name')
      .populate('currentLevel', 'levelName levelNumber')
      .populate('currentHandler', 'name email designation')
      .populate('createdBy', 'name email');

    // Notify file creator about completion
    try {
      await createBulkNotifications(
        [file.createdBy._id],
        req.user._id,
        file._id,
        'completed',
        'Workflow Completed',
        `${req.user.name} has completed the workflow for "${file.title}". All reviews are done!`,
        `/files/${file._id}`
      );
    } catch (notifError) {
      console.error('Error creating notifications:', notifError);
    }

    res.json({
      success: true,
      message: 'Workflow completed successfully.',
      file: populatedFile,
      workflow
    });
  } catch (error) {
    console.error('Complete file error:', error);
    res.status(500).json({
      success: false,
      message: 'Error completing workflow.',
      error: error.message
    });
  }
};
