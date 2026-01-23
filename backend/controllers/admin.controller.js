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
        defaultHandler: levels[i].defaultHandler,
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
    const { departmentId, levelName, description, defaultHandler } = req.body;

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
      defaultHandler: defaultHandler || null,
      nextLevel: null
    });

    // Update previous level's nextLevel to point to this new level
    if (highestLevel) {
      highestLevel.nextLevel = newLevel._id;
      await highestLevel.save();
    }

    const populatedLevel = await Level.findById(newLevel._id)
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
    const { levelName, description, defaultHandler } = req.body;

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
    if (defaultHandler !== undefined) level.defaultHandler = defaultHandler || null;

    await level.save();

    const populatedLevel = await Level.findById(level._id)
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
    const { name, email, password, role, department, level, designation, accessibleDepartments } = req.body;

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
    if (department) filter.department = department;
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .populate('department', 'name')
      .populate('accessibleDepartments', 'name')
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
    ).select('-password').populate('department');

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
