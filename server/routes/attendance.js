const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { getDayRange } = require('../utils/helpers');

// @route   POST /api/attendance/checkin
// @desc    Record check-in
// @access  Member (own) or Admin
router.post('/checkin', authenticate, async (req, res) => {
  try {
    const { memberId, method = 'web', photoUrl, notes, trainerId } = req.body;

    // Determine member ID: admin can specify, member uses own ID
    const targetMemberId = req.user.role === 'admin' ? memberId || req.user._id : req.user._id;

    if (!targetMemberId) {
      return res.status(400).json({
        success: false,
        message: 'Member ID is required',
      });
    }

    // Check if already checked in today
    const { start, end } = getDayRange(new Date());
    const existingCheckin = await Attendance.findOne({
      memberId: targetMemberId,
      checkinAt: { $gte: start, $lte: end },
    });

    if (existingCheckin && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Already checked in today',
      });
    }

    const attendance = await Attendance.create({
      memberId: targetMemberId,
      trainerId: trainerId || null,
      method,
      photoUrl: photoUrl || '',
      notes: notes || '',
    });

    const attendanceWithDetails = await Attendance.findById(attendance._id)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name email');

    res.status(201).json({
      success: true,
      message: 'Check-in recorded successfully',
      data: attendanceWithDetails,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to record check-in',
      error: error.message,
    });
  }
});

// @route   GET /api/attendance
// @desc    Get attendance records (with filters)
// @access  Admin/Trainer/Member (own)
router.get('/', authenticate, async (req, res) => {
  try {
    const { memberId, trainerId, from, to, page = 1, limit = 20 } = req.query;
    const query = {};

    // Role-based filtering
    if (req.user.role === 'member') {
      query.memberId = req.user._id;
    } else if (req.user.role === 'trainer') {
      query.trainerId = req.user._id;
    }

    // Additional filters
    if (memberId && (req.user.role === 'admin' || req.user.role === 'trainer')) {
      query.memberId = memberId;
    }

    if (trainerId && req.user.role === 'admin') {
      query.trainerId = trainerId;
    }

    // Date range filter
    if (from || to) {
      query.checkinAt = {};
      if (from) {
        query.checkinAt.$gte = new Date(from);
      }
      if (to) {
        const toDate = new Date(to);
        toDate.setHours(23, 59, 59, 999);
        query.checkinAt.$lte = toDate;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const attendance = await Attendance.find(query)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name email')
      .sort({ checkinAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Attendance.countDocuments(query);

    res.json({
      success: true,
      data: attendance,
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
      message: 'Failed to fetch attendance',
      error: error.message,
    });
  }
});

// @route   GET /api/attendance/today
// @desc    Get today's check-ins
// @access  Admin/Trainer
router.get('/today', authenticate, roleCheck('admin', 'trainer'), async (req, res) => {
  try {
    const { start, end } = getDayRange(new Date());
    const query = { checkinAt: { $gte: start, $lte: end } };

    if (req.user.role === 'trainer') {
      query.trainerId = req.user._id;
    }

    const attendance = await Attendance.find(query)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name email')
      .sort({ checkinAt: -1 });

    res.json({
      success: true,
      data: attendance,
      count: attendance.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s attendance',
      error: error.message,
    });
  }
});

module.exports = router;

