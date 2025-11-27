const express = require('express');
const router = express.Router();
const WorkoutPlan = require('../models/WorkoutPlan');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   POST /api/workout-plans
// @desc    Create workout plan
// @access  Trainer
router.post('/', authenticate, roleCheck('trainer'), async (req, res) => {
  try {
    const { memberId, title, sessions } = req.body;

    if (!memberId || !title) {
      return res.status(400).json({
        success: false,
        message: 'Member ID and title are required',
      });
    }

    // Check if workout plan already exists for this member
    const existing = await WorkoutPlan.findOne({ memberId, trainerId: req.user._id });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Workout plan already exists for this member',
      });
    }

    const workoutPlan = await WorkoutPlan.create({
      trainerId: req.user._id,
      memberId,
      title,
      sessions: sessions || [],
    });

    const workoutPlanWithDetails = await WorkoutPlan.findById(workoutPlan._id)
      .populate('trainerId', 'name email')
      .populate('memberId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Workout plan created successfully',
      data: workoutPlanWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create workout plan',
      error: error.message,
    });
  }
});

// @route   GET /api/workout-plans/member/:memberId
// @desc    Get member's workout plan
// @access  Trainer/Member/Owner
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check access
    if (
      req.user.role !== 'trainer' &&
      req.user.role !== 'admin' &&
      req.user._id.toString() !== memberId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const workoutPlan = await WorkoutPlan.findOne({ memberId })
      .populate('trainerId', 'name email')
      .populate('memberId', 'name email')
      .sort({ updatedAt: -1 });

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found',
      });
    }

    res.json({
      success: true,
      data: workoutPlan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch workout plan',
      error: error.message,
    });
  }
});

// @route   PUT /api/workout-plans/:id
// @desc    Update workout plan
// @access  Trainer (own plans)
router.put('/:id', authenticate, roleCheck('trainer'), async (req, res) => {
  try {
    const workoutPlan = await WorkoutPlan.findById(req.params.id);

    if (!workoutPlan) {
      return res.status(404).json({
        success: false,
        message: 'Workout plan not found',
      });
    }

    // Check if trainer owns this plan
    if (workoutPlan.trainerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { title, sessions } = req.body;

    if (title) workoutPlan.title = title;
    if (sessions !== undefined) workoutPlan.sessions = sessions;

    await workoutPlan.save();

    const workoutPlanWithDetails = await WorkoutPlan.findById(workoutPlan._id)
      .populate('trainerId', 'name email')
      .populate('memberId', 'name email');

    res.json({
      success: true,
      message: 'Workout plan updated successfully',
      data: workoutPlanWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update workout plan',
      error: error.message,
    });
  }
});

module.exports = router;

