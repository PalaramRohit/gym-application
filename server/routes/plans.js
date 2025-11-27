const express = require('express');
const router = express.Router();
const Plan = require('../models/Plan');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { body, validationResult } = require('express-validator');

// @route   GET /api/plans
// @desc    Get all plans
// @access  Public
router.get('/', async (req, res) => {
  try {
    const plans = await Plan.find().sort({ price: 1 });
    res.json({
      success: true,
      data: plans,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plans',
      error: error.message,
    });
  }
});

// @route   GET /api/plans/:id
// @desc    Get plan by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    res.json({
      success: true,
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch plan',
      error: error.message,
    });
  }
});

// @route   POST /api/plans
// @desc    Create plan
// @access  Admin only
router.post(
  '/',
  authenticate,
  roleCheck('admin'),
  [
    body('name').trim().notEmpty().withMessage('Plan name is required'),
    body('durationInDays').isInt({ min: 1 }).withMessage('Duration must be at least 1 day'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation errors',
          errors: errors.array(),
        });
      }

      const { name, durationInDays, price, perks, maxSessionsPerWeek } = req.body;

      const plan = await Plan.create({
        name,
        durationInDays,
        price,
        perks: perks || [],
        maxSessionsPerWeek: maxSessionsPerWeek || null,
      });

      res.status(201).json({
        success: true,
        message: 'Plan created successfully',
        data: plan,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to create plan',
        error: error.message,
      });
    }
  }
);

// @route   PUT /api/plans/:id
// @desc    Update plan
// @access  Admin only
router.put('/:id', authenticate, roleCheck('admin'), async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    const { name, durationInDays, price, perks, maxSessionsPerWeek } = req.body;

    if (name) plan.name = name;
    if (durationInDays !== undefined) plan.durationInDays = durationInDays;
    if (price !== undefined) plan.price = price;
    if (perks !== undefined) plan.perks = perks;
    if (maxSessionsPerWeek !== undefined) plan.maxSessionsPerWeek = maxSessionsPerWeek;

    await plan.save();

    res.json({
      success: true,
      message: 'Plan updated successfully',
      data: plan,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update plan',
      error: error.message,
    });
  }
});

// @route   DELETE /api/plans/:id
// @desc    Delete plan
// @access  Admin only
router.delete('/:id', authenticate, roleCheck('admin'), async (req, res) => {
  try {
    const plan = await Plan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    await plan.deleteOne();

    res.json({
      success: true,
      message: 'Plan deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete plan',
      error: error.message,
    });
  }
});

module.exports = router;

