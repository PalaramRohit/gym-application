const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

// @route   GET /api/users
// @desc    Get all users (with filters)
// @access  Admin only
router.get('/', authenticate, roleCheck('admin'), async (req, res) => {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const query = {};

    if (role) {
      query.role = role;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(query)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Admin/Trainer/Owner
router.get('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-passwordHash');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check access: admin can see all, trainer can see members, user can see own
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'trainer' &&
      req.user._id.toString() !== req.params.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: error.message,
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Admin or Owner
router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check access
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
      });
    }

    const { name, phone, dob, emergencyContact, profilePhotoUrl } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (dob) user.dob = new Date(dob);
    if (emergencyContact) user.emergencyContact = emergencyContact;
    if (profilePhotoUrl !== undefined) user.profilePhotoUrl = profilePhotoUrl;

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update user',
      error: error.message,
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user
// @access  Admin only
router.delete('/:id', authenticate, roleCheck('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    await user.deleteOne();

    res.json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete user',
      error: error.message,
    });
  }
});

module.exports = router;

