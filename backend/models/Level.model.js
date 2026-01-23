const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  levelNumber: {
    type: Number,
    required: true
  },
  levelName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  // The user assigned as default handler for this level
  defaultHandler: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  // Next level in hierarchy (null for final level)
  nextLevel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Level',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique level numbers per department
levelSchema.index({ department: 1, levelNumber: 1 }, { unique: true });

module.exports = mongoose.model('Level', levelSchema);
