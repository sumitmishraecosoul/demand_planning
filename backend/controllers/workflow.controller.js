const Workflow = require('../models/Workflow.model');
const File = require('../models/File.model');
const Level = require('../models/Level.model');
const User = require('../models/User.model');

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

    // Check if user is current handler
    if (file.currentHandler.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        success: false, 
        message: 'You are not authorized to pass this file.' 
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

    // Validate next handler belongs to department
    const nextHandlerUser = await User.findById(nextHandler);
    if (!nextHandlerUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'Next handler not found.' 
      });
    }

    if (nextHandlerUser.department.toString() !== file.department.toString()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Next handler must be from the same department.' 
      });
    }

    // Update file
    file.currentLevel = nextLevel._id;
    file.currentHandler = nextHandler;
    file.status = 'in-progress';

    // Add step to workflow
    workflow.steps.push({
      level: file.currentLevel._id,
      handler: req.user._id,
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
    const { excludeMe } = req.query;

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
