const express = require('express');
const router = express.Router();
const Trainer = require('../models/Trainer');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   POST /api/trainers
// @desc    Create trainer profile
// @access  Admin only
router.post('/', authenticate, roleCheck('admin'), async (req, res) => {
  try {
    const { userId, bio, specialty, experienceYears, photoUrl } = req.body;

    // Check if user exists and is a trainer
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (user.role !== 'trainer') {
      return res.status(400).json({
        success: false,
        message: 'User must have trainer role',
      });
    }

    // Check if trainer profile already exists
    const existingTrainer = await Trainer.findOne({ userId });
    if (existingTrainer) {
      return res.status(400).json({
        success: false,
        message: 'Trainer profile already exists',
      });
    }

    const trainer = await Trainer.create({
      userId,
      bio,
      specialty,
      experienceYears,
      photoUrl,
    });

    const trainerWithUser = await Trainer.findById(trainer._id).populate('userId', 'name email phone');

    res.status(201).json({
      success: true,
      message: 'Trainer created successfully',
      data: trainerWithUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create trainer',
      error: error.message,
    });
  }
});

// @route   GET /api/trainers
// @desc    Get all trainers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const trainers = await Trainer.find()
      .populate('userId', 'name email phone profilePhotoUrl')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: trainers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainers',
      error: error.message,
    });
  }
});

// @route   GET /api/trainers/:id
// @desc    Get trainer by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id).populate(
      'userId',
      'name email phone profilePhotoUrl'
    );

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found',
      });
    }

    res.json({
      success: true,
      data: trainer,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch trainer',
      error: error.message,
    });
  }
});

// @route   PUT /api/trainers/:id
// @desc    Update trainer
// @access  Admin or Trainer (own profile)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const trainer = await Trainer.findById(req.params.id);

    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer not found',
      });
    }

    // Check access
    if (req.user.role !== 'admin' && trainer.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { bio, specialty, experienceYears, photoUrl } = req.body;

    if (bio !== undefined) trainer.bio = bio;
    if (specialty !== undefined) trainer.specialty = specialty;
    if (experienceYears !== undefined) trainer.experienceYears = experienceYears;
    if (photoUrl !== undefined) trainer.photoUrl = photoUrl;

    await trainer.save();

    const trainerWithUser = await Trainer.findById(trainer._id).populate('userId', 'name email phone');

    res.json({
      success: true,
      message: 'Trainer updated successfully',
      data: trainerWithUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update trainer',
      error: error.message,
    });
  }
});

module.exports = router;

