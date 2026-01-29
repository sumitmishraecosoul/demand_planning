const User = require('../models/User.model');
const Department = require('../models/Department.model');
const Level = require('../models/Level.model');

// Create department
exports.createDepartment = async (req, res) => {
  try {
    const { name, description } = req.body;

    const department = await Department.create({
      name,
      description,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Department created successfully.',
      department
    });
  } catch (error) {
    console.error('Create department error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating department.', 
      error: error.message 
    });
  }
};

// Get all departments
exports.getDepartments = async (req, res) => {
  try {
    const departments = await Department.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      departments
    });
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching departments.', 
      error: error.message 
    });
  }
};

// Create levels for a department
exports.createLevels = async (req, res) => {
  try {
    const { departmentId, levels } = req.body;

    // Validate department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found.' 
      });
    }

    // Delete existing levels for this department
    await Level.deleteMany({ department: departmentId });

    // Create new levels
    const createdLevels = [];
    let previousLevel = null;

    for (let i = 0; i < levels.length; i++) {
      const level = await Level.create({
        department: departmentId,
        levelNumber: i + 1,
        levelName: levels[i].levelName,
        description: levels[i].description,
        handlers: levels[i].handlers || [], // Support multiple handlers
        defaultHandler: levels[i].defaultHandler || (levels[i].handlers && levels[i].handlers[0]), // Backward compatibility
        nextLevel: null
      });

      // Update previous level's nextLevel
      if (previousLevel) {
        previousLevel.nextLevel = level._id;
        await previousLevel.save();
      }

      createdLevels.push(level);
      previousLevel = level;
    }

    res.status(201).json({
      success: true,
      message: 'Levels created successfully.',
      levels: createdLevels
    });
  } catch (error) {
    console.error('Create levels error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating levels.', 
      error: error.message 
    });
  }
};

// Get levels for a department
exports.getLevelsByDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;

    const levels = await Level.find({ 
      department: departmentId, 
      isActive: true 
    })
    .populate('handlers', 'name email designation')
    .populate('defaultHandler', 'name email designation')
    .populate('nextLevel', 'levelName levelNumber')
    .sort({ levelNumber: 1 });

    res.json({
      success: true,
      levels
    });
  } catch (error) {
    console.error('Get levels error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching levels.', 
      error: error.message 
    });
  }
};

// Add a single level to a department
exports.addLevel = async (req, res) => {
  try {
    const { departmentId, levelName, description, defaultHandler, handlers } = req.body;

    // Validate department
    const department = await Department.findById(departmentId);
    if (!department) {
      return res.status(404).json({ 
        success: false, 
        message: 'Department not found.' 
      });
    }

    // Get the highest level number for this department
    const highestLevel = await Level.findOne({ department: departmentId })
      .sort({ levelNumber: -1 });
    
    const newLevelNumber = highestLevel ? highestLevel.levelNumber + 1 : 1;

    // Create new level
    const newLevel = await Level.create({
      department: departmentId,
      levelNumber: newLevelNumber,
      levelName,
      description,
      handlers: handlers || [],
      defaultHandler: defaultHandler || (handlers && handlers[0]) || null,
      nextLevel: null
    });

    // Update previous level's nextLevel to point to this new level
    if (highestLevel) {
      highestLevel.nextLevel = newLevel._id;
      await highestLevel.save();
    }

    const populatedLevel = await Level.findById(newLevel._id)
      .populate('handlers', 'name email designation')
      .populate('defaultHandler', 'name email designation')
      .populate('nextLevel', 'levelName levelNumber');

    res.status(201).json({
      success: true,
      message: 'Level added successfully.',
      level: populatedLevel
    });
  } catch (error) {
    console.error('Add level error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error adding level.', 
      error: error.message 
    });
  }
};

// Update a single level
exports.updateLevel = async (req, res) => {
  try {
    const { levelId } = req.params;
    const { levelName, description, defaultHandler, handlers } = req.body;

    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found.' 
      });
    }

    // Update level fields
    if (levelName) level.levelName = levelName;
    if (description !== undefined) level.description = description;
    if (handlers !== undefined) {
      level.handlers = handlers;
      level.defaultHandler = handlers && handlers[0] ? handlers[0] : null;
    } else if (defaultHandler !== undefined) {
      level.defaultHandler = defaultHandler || null;
    }

    await level.save();

    const populatedLevel = await Level.findById(level._id)
      .populate('handlers', 'name email designation')
      .populate('defaultHandler', 'name email designation')
      .populate('nextLevel', 'levelName levelNumber');

    res.json({
      success: true,
      message: 'Level updated successfully.',
      level: populatedLevel
    });
  } catch (error) {
    console.error('Update level error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating level.', 
      error: error.message 
    });
  }
};

// Delete a level
exports.deleteLevel = async (req, res) => {
  try {
    const { levelId } = req.params;

    const level = await Level.findById(levelId);
    if (!level) {
      return res.status(404).json({ 
        success: false, 
        message: 'Level not found.' 
      });
    }

    // Find the previous level that points to this one
    const previousLevel = await Level.findOne({ nextLevel: levelId });
    
    // Update previous level to point to this level's next level
    if (previousLevel) {
      previousLevel.nextLevel = level.nextLevel;
      await previousLevel.save();
    }

    await Level.findByIdAndDelete(levelId);

    res.json({
      success: true,
      message: 'Level deleted successfully.'
    });
  } catch (error) {
    console.error('Delete level error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting level.', 
      error: error.message 
    });
  }
};

// Create user/employee
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, level, designation, accessibleDepartments, departmentAssignments } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User with this email already exists.' 
      });
    }

    const userData = {
      name,
      email,
      password,
      role,
      isActive: true
    };

    if (role === 'user') {
      userData.department = department;
      userData.level = level;
      userData.designation = designation;
    } else if (role === 'director') {
      userData.department = department;
      userData.designation = designation;
      userData.accessibleDepartments = accessibleDepartments || [department];
      userData.departmentAssignments = departmentAssignments || [];
    }

    const user = await User.create(userData);

    res.status(201).json({
      success: true,
      message: 'User created successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        level: user.level,
        designation: user.designation
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating user.', 
      error: error.message 
    });
  }
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const { department, role } = req.query;
    
    const filter = { isActive: true };
    
    // If department filter is provided, include:
    // 1. Regular users whose department matches
    // 2. Directors who have this department in accessibleDepartments
    if (department) {
      filter.$or = [
        { department: department }, // Regular users
        { 
          role: 'director',
          accessibleDepartments: department // Directors with access
        }
      ];
    }
    
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .populate('department', 'name')
      .populate('accessibleDepartments', 'name')
      .populate({
        path: 'departmentAssignments.department',
        select: 'name'
      })
      .populate({
        path: 'departmentAssignments.level',
        select: 'levelName levelNumber'
      })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching users.', 
      error: error.message 
    });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;

    // Don't allow password update through this endpoint
    delete updates.password;

    const user = await User.findByIdAndUpdate(
      userId,
      updates,
      { new: true, runValidators: true }
    ).select('-password')
    .populate('department')
    .populate('accessibleDepartments')
    .populate({
      path: 'departmentAssignments.department',
      select: 'name'
    })
    .populate({
      path: 'departmentAssignments.level',
      select: 'levelName levelNumber'
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully.',
      user
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating user.', 
      error: error.message 
    });
  }
};

// Deactivate user
exports.deactivateUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    res.json({
      success: true,
      message: 'User deactivated successfully.',
      user
    });
  } catch (error) {
    console.error('Deactivate user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deactivating user.', 
      error: error.message 
    });
  }
};

// Delete user permanently
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found.' 
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully.'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user.', 
      error: error.message 
    });
  }
};

// Fix files with missing currentLevel or currentHandler
exports.fixBrokenFiles = async (req, res) => {
  try {
    const File = require('../models/File.model');
    const Level = require('../models/Level.model');

    // Find all files with null currentLevel or currentHandler
    const brokenFiles = await File.find({
      $or: [
        { currentLevel: null },
        { currentHandler: null }
      ]
    }).populate('department');

    if (brokenFiles.length === 0) {
      return res.json({
        success: true,
        message: 'No broken files found. All files are valid!',
        fixed: 0
      });
    }

    let fixed = 0;
    const errors = [];

    for (const file of brokenFiles) {
      try {
        // Get first level of the file's department
        const firstLevel = await Level.findOne({
          department: file.department._id,
          levelNumber: 1,
          isActive: true
        }).populate('handlers');

        if (!firstLevel || !firstLevel.handlers || firstLevel.handlers.length === 0) {
          errors.push({
            fileId: file._id,
            title: file.title,
            error: 'No Level 1 or handlers found for department'
          });
          continue;
        }

        // Fix the file
        file.currentLevel = firstLevel._id;
        file.currentHandler = firstLevel.handlers[0]._id;
        await file.save();
        fixed++;
      } catch (error) {
        errors.push({
          fileId: file._id,
          title: file.title,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Fixed ${fixed} out of ${brokenFiles.length} broken files.`,
      fixed,
      total: brokenFiles.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Fix broken files error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fixing files.',
      error: error.message
    });
  }
};

// Delete department
exports.deleteDepartment = async (req, res) => {
  try {
    const { departmentId } = req.params;
    const File = require('../models/File.model');
    const Workflow = require('../models/Workflow.model');

    const department = await Department.findById(departmentId);

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found.'
      });
    }

    // Check if there are any files in this department
    const filesCount = await File.countDocuments({ department: departmentId });
    
    if (filesCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department. There are ${filesCount} files associated with this department. Please delete or reassign all files first.`
      });
    }

    // Delete all levels in this department
    const deletedLevels = await Level.deleteMany({ department: departmentId });

    // Delete all users in this department (or mark as inactive)
    await User.updateMany(
      { department: departmentId },
      { isActive: false }
    );

    // Remove department from directors' accessible departments
    await User.updateMany(
      { 'departmentAssignments.department': departmentId },
      { $pull: { departmentAssignments: { department: departmentId } } }
    );

    // Delete the department
    await Department.findByIdAndDelete(departmentId);

    res.json({
      success: true,
      message: 'Department deleted successfully.',
      deleted: {
        levels: deletedLevels.deletedCount,
        department: 1
      }
    });
  } catch (error) {
    console.error('Delete department error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting department.',
      error: error.message
    });
  }
};
