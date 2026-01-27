const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'director', 'user'],
    default: 'user'
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: function() {
      return this.role === 'user' || this.role === 'director';
    }
  },
  // For director - can access multiple departments
  accessibleDepartments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department'
  }],
  // For director - specific level assignments in each department
  departmentAssignments: [{
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department'
    },
    level: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Level'
    }
  }],
  level: {
    type: Number,
    required: function() {
      return this.role === 'user';
    }
  },
  designation: {
    type: String,
    required: function() {
      return this.role === 'user' || this.role === 'director';
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
