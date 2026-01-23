const mongoose = require('mongoose');

const fileVersionSchema = new mongoose.Schema({
  versionNumber: {
    type: Number,
    required: true
  },
  fileName: {
    type: String,
    required: true
  },
  filePath: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  },
  signature: {
    type: String,
    required: true
  },
  comments: {
    type: String
  }
});

const fileSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  channel: {
    type: String,
    trim: true
  },
  demandType: {
    type: String,
    enum: ['Regular', 'Promotional', 'Seasonal', 'Emergency'],
    default: 'Regular'
  },
  month: {
    type: String,
    trim: true
  },
  year: {
    type: Number
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  currentLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  currentHandler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'approved', 'rejected', 'completed'],
    default: 'pending'
  },
  versions: [fileVersionSchema],
  currentVersion: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('File', fileSchema);
