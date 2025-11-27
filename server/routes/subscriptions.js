const express = require('express');
const router = express.Router();
const Subscription = require('../models/Subscription');
const Plan = require('../models/Plan');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   POST /api/subscriptions
// @desc    Create subscription
// @access  Admin or Member (own)
router.post('/', authenticate, async (req, res) => {
  try {
    const { memberId, planId, startDate } = req.body;

    // Check access: admin can create for any member, member can create for self
    const targetMemberId = req.user.role === 'admin' ? memberId : req.user._id;

    if (!targetMemberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required',
      });
    }

    const plan = await Plan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found',
      });
    }

    const start = startDate ? new Date(startDate) : new Date();
    const end = new Date(start);
    end.setDate(end.getDate() + plan.durationInDays);

    // Deactivate existing active subscriptions
    await Subscription.updateMany(
      { memberId: targetMemberId, status: 'active' },
      { status: 'cancelled' }
    );

    const subscription = await Subscription.create({
      memberId: targetMemberId,
      planId,
      startDate: start,
      endDate: end,
      status: 'active',
      paymentRef: `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });

    const subscriptionWithDetails = await Subscription.findById(subscription._id)
      .populate('memberId', 'name email')
      .populate('planId', 'name durationInDays price');

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscriptionWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to create subscription',
      error: error.message,
    });
  }
});

// @route   GET /api/subscriptions/member/:memberId
// @desc    Get member subscriptions
// @access  Admin/Trainer/Owner
router.get('/member/:memberId', authenticate, async (req, res) => {
  try {
    const { memberId } = req.params;

    // Check access
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'trainer' &&
      req.user._id.toString() !== memberId
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const subscriptions = await Subscription.find({ memberId })
      .populate('planId', 'name durationInDays price perks')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscriptions',
      error: error.message,
    });
  }
});

// @route   PUT /api/subscriptions/:id
// @desc    Update subscription status
// @access  Admin only
router.put('/:id', authenticate, roleCheck('admin'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'expired', 'cancelled'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status',
      });
    }

    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found',
      });
    }

    subscription.status = status;
    await subscription.save();

    const subscriptionWithDetails = await Subscription.findById(subscription._id)
      .populate('memberId', 'name email')
      .populate('planId', 'name durationInDays price');

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: subscriptionWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update subscription',
      error: error.message,
    });
  }
});

module.exports = router;

