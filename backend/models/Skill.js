const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Frontend', 'Backend', 'Database', 'Tools', 'Other'],
    trim: true
  },
  proficiency: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  icon: {
    type: String,
    default: null
  },
  color: {
    type: String,
    default: '#000000'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Skill', skillSchema);
