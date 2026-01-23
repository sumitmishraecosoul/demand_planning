const User = require('../models/User.model');
const File = require('../models/File.model');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department', 'name')
      .populate('accessibleDepartments', 'name');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching profile.', 
      error: error.message 
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    )
      .select('-password')
      .populate('department', 'name')
      .populate('accessibleDepartments', 'name');

    res.json({
      success: true,
      message: 'Profile updated successfully.',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating profile.', 
      error: error.message 
    });
  }
};

// Get dashboard stats
exports.getDashboardStats = async (req, res) => {
  try {
    let departmentFilter = {};

    if (req.user.role === 'admin') {
      // Admin can see all
    } else if (req.user.role === 'director') {
      departmentFilter = { 
        department: { $in: req.user.accessibleDepartments } 
      };
    } else {
      departmentFilter = { department: req.user.department };
    }

    // Get stats
    const totalFiles = await File.countDocuments({ 
      ...departmentFilter, 
      isActive: true 
    });

    const myFiles = await File.countDocuments({ 
      currentHandler: req.user._id,
      isActive: true 
    });

    const pendingFiles = await File.countDocuments({ 
      ...departmentFilter,
      status: 'pending',
      isActive: true 
    });

    const inProgressFiles = await File.countDocuments({ 
      ...departmentFilter,
      status: 'in-progress',
      isActive: true 
    });

    const completedFiles = await File.countDocuments({ 
      ...departmentFilter,
      status: 'completed',
      isActive: true 
    });

    const rejectedFiles = await File.countDocuments({ 
      ...departmentFilter,
      status: 'rejected',
      isActive: true 
    });

    res.json({
      success: true,
      stats: {
        totalFiles,
        myFiles,
        pendingFiles,
        inProgressFiles,
        completedFiles,
        rejectedFiles
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching dashboard stats.', 
      error: error.message 
    });
  }
};
