const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const Skill = require('../models/Skill');

// @route   GET /api/skills
// @desc    Get all skills
// @access  Public
router.get('/', async (req, res) => {
  try {
    const skills = await Skill.find().sort({ category: 1, proficiency: -1 });
    
    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json(groupedSkills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/skills/category/:category
// @desc    Get skills by category
// @access  Public
router.get('/category/:category', async (req, res) => {
  try {
    const skills = await Skill.find({ category: req.params.category })
      .sort({ proficiency: -1 });
    res.json(skills);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/skills
// @desc    Add a new skill
// @access  Private
router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Skill name is required'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('proficiency').isInt({ min: 1, max: 100 }).withMessage('Proficiency must be between 1-100')
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, category, proficiency, icon, color } = req.body;

      const skill = new Skill({
        name,
        category,
        proficiency,
        icon,
        color
      });

      await skill.save();
      res.status(201).json(skill);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/skills/:id
// @desc    Update a skill
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json(skill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/skills/:id
// @desc    Delete a skill
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);

    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Seed initial skills data
router.post('/seed', async (req, res) => {
  try {
    const initialSkills = [
      // Frontend
      { name: 'React', category: 'Frontend', proficiency: 90, color: '#61DAFB' },
      { name: 'JavaScript', category: 'Frontend', proficiency: 95, color: '#F7DF1E' },
      { name: 'TypeScript', category: 'Frontend', proficiency: 85, color: '#3178C6' },
      { name: 'HTML5', category: 'Frontend', proficiency: 95, color: '#E34F26' },
      { name: 'CSS3', category: 'Frontend', proficiency: 90, color: '#1572B6' },
      { name: 'Tailwind CSS', category: 'Frontend', proficiency: 88, color: '#06B6D4' },
      
      // Backend
      { name: 'Node.js', category: 'Backend', proficiency: 85, color: '#339933' },
      { name: 'Express.js', category: 'Backend', proficiency: 88, color: '#404040' },
      
      // Database
      { name: 'MongoDB', category: 'Database', proficiency: 80, color: '#47A248' },
      { name: 'Mongoose', category: 'Database', proficiency: 82, color: '#880000' },
      
      // Tools
      { name: 'Git', category: 'Tools', proficiency: 85, color: '#F05032' },
      { name: 'GitHub', category: 'Tools', proficiency: 88, color: '#181717' },
      { name: 'VS Code', category: 'Tools', proficiency: 90, color: '#007ACC' },
      { name: 'Postman', category: 'Tools', proficiency: 80, color: '#FF6C37' },
      
      // Other
      { name: 'REST API', category: 'Other', proficiency: 90, color: '#009688' },
      { name: 'JSON', category: 'Other', proficiency: 95, color: '#000000' }
    ];

    await Skill.deleteMany({});
    await Skill.insertMany(initialSkills);

    res.json({ message: 'Skills seeded successfully', count: initialSkills.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
