const mongoose = require('mongoose');

const workflowStepSchema = new mongoose.Schema({
  level: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    required: true
  },
  handler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Multiple handlers assigned to this step (if applicable)
  assignedHandlers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  action: {
    type: String,
    enum: ['uploaded', 'reviewed', 'approved', 'rejected', 'updated', 'passed'],
    required: true
  },
  signature: {
    type: String,
    required: true
  },
  comments: {
    type: String
  },
  fileVersion: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const workflowSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    required: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  steps: [workflowStepSchema],
  currentStep: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'rejected'],
    default: 'active'
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Workflow', workflowSchema);
