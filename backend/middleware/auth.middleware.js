const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Verify JWT token
exports.authenticate = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).populate('department accessibleDepartments');

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user deactivated.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token.' 
    });
  }
};

// Check if user is admin
exports.isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Admin role required.' 
    });
  }
  next();
};

// Check if user is director
exports.isDirector = (req, res, next) => {
  if (req.user.role !== 'director' && req.user.role !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Director role required.' 
    });
  }
  next();
};

// Check if user has access to specific department
exports.hasDepartmentAccess = (req, res, next) => {
  const departmentId = req.params.departmentId || req.body.department;
  
  if (req.user.role === 'admin') {
    return next();
  }
  
  if (req.user.role === 'director') {
    const hasAccess = req.user.accessibleDepartments.some(
      dept => dept._id.toString() === departmentId
    );
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You do not have access to this department.' 
      });
    }
    return next();
  }
  
  if (req.user.department._id.toString() !== departmentId) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your own department.' 
    });
  }
  
  next();
};
