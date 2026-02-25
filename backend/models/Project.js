const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  technologies: [{
    type: String,
    trim: true
  }],
  imageUrl: {
    type: String,
    default: null
  },
  githubUrl: {
    type: String,
    default: null
  },
  liveUrl: {
    type: String,
    default: null
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Project', projectSchema);
