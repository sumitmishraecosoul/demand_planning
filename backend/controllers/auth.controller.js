const User = require('../models/User.model');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
};

// Generate Refresh Token
const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d'
  });
};

// Register user
exports.register = async (req, res) => {
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

    // Create new user
    const userData = {
      name,
      email,
      password,
      role: role || 'user',
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

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
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
    console.error('Register error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error registering user.', 
      error: error.message 
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password.' 
      });
    }

    // Find user
    const user = await User.findOne({ email })
      .populate('department')
      .populate('accessibleDepartments');

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials.' 
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Your account has been deactivated. Please contact admin.' 
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials.' 
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        level: user.level,
        designation: user.designation,
        accessibleDepartments: user.accessibleDepartments
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error logging in.', 
      error: error.message 
    });
  }
};

// Logout user
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({
    success: true,
    message: 'Logout successful.'
  });
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('department')
      .populate('accessibleDepartments');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching user data.', 
      error: error.message 
    });
  }
};

// Refresh token
exports.refreshToken = async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token provided.' 
      });
    }

    // Verify token (even if expired, we'll check the payload)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      // If token is expired, try to decode without verification to get userId
      if (error.name === 'TokenExpiredError') {
        decoded = jwt.decode(token);
      } else {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid token.' 
        });
      }
    }

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }

    // Find user
    const user = await User.findById(decoded.userId)
      .populate('department')
      .populate('accessibleDepartments');

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found or inactive.' 
      });
    }

    // Generate new tokens
    const newToken = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // Set cookie
    res.cookie('token', newToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      sameSite: 'lax'
    });

    res.json({
      success: true,
      message: 'Token refreshed successfully.',
      token: newToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        level: user.level,
        designation: user.designation,
        accessibleDepartments: user.accessibleDepartments
      }
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error refreshing token.', 
      error: error.message 
    });
  }
};
