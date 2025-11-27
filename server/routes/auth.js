const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const jwtConfig = require('../config/jwt');

// @route   POST /api/auth/register
// @desc    Register new member
// @access  Public
router.post(
  '/register',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone').optional().trim(),
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

      const { name, email, password, phone, dob, emergencyContact, role, roleKey } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Validate requested role. Default to 'member'. For elevated roles, require invite codes.
      let assignedRole = 'member';
      if (role && ['admin', 'trainer', 'member'].includes(role)) {
        if (role === 'member') {
          assignedRole = 'member';
        } else if (role === 'trainer') {
          // require trainer invite code if configured
          const trainerKey = process.env.TRAINER_INVITE_CODE;
          if (trainerKey) {
            if (!roleKey || roleKey !== trainerKey) {
              return res.status(403).json({ success: false, message: 'Invalid trainer invite code' });
            }
            assignedRole = 'trainer';
          } else {
            // if no trainer key configured, allow with any non-empty roleKey (for testing)
            if (!roleKey) {
              return res.status(403).json({ success: false, message: 'Trainer invite code required' });
            }
            assignedRole = 'trainer';
          }
        } else if (role === 'admin') {
          const adminKey = process.env.ADMIN_INVITE_CODE;
          if (adminKey) {
            if (!roleKey || roleKey !== adminKey) {
              return res.status(403).json({ success: false, message: 'Invalid admin invite code' });
            }
            assignedRole = 'admin';
          } else {
            // if no admin key configured, allow with any non-empty roleKey (for testing)
            if (!roleKey) {
              return res.status(403).json({ success: false, message: 'Admin invite code required' });
            }
            assignedRole = 'admin';
          }
        }
      }

      // Create user
      const user = await User.create({
        name,
        email,
        passwordHash,
        phone,
        dob: dob ? new Date(dob) : undefined,
        emergencyContact,
        role: assignedRole,
      });

      // Generate JWT
      const token = jwt.sign({ userId: user._id }, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      });

      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
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

      const { email, password } = req.body;

      // Find user with password hash
      const user = await User.findOne({ email }).select('+passwordHash');
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Generate JWT
      const token = jwt.sign({ userId: user._id }, jwtConfig.secret, {
        expiresIn: jwtConfig.expiresIn,
      });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            phone: user.phone,
            profilePhotoUrl: user.profilePhotoUrl,
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: error.message,
      });
    }
  }
);

// @route   POST /api/auth/logout
// @desc    Logout (client-side token removal)
// @access  Public
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful',
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
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

module.exports = router;

