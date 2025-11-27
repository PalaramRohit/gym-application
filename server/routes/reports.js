const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const authenticate = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const { exportAttendanceCSV, exportMembersCSV } = require('../utils/csvExport');

// @route   GET /api/reports/attendance.csv
// @desc    Export attendance CSV
// @access  Admin
router.get('/attendance.csv', authenticate, roleCheck('admin'), async (req, res) => {
  try {
    const { from, to } = req.query;
    const query = {};

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

    const attendance = await Attendance.find(query)
      .populate('memberId', 'name email')
      .populate('trainerId', 'name email')
      .sort({ checkinAt: -1 });

    const filePath = path.join(__dirname, '../../temp', `attendance-${Date.now()}.csv`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    await exportAttendanceCSV(attendance, filePath);

    res.download(filePath, 'attendance.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export attendance',
      error: error.message,
    });
  }
});

// @route   GET /api/reports/members.csv
// @desc    Export members CSV
// @access  Admin
router.get('/members.csv', authenticate, roleCheck('admin'), async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};

    const members = await User.find(query).select('-passwordHash').sort({ createdAt: -1 });

    const filePath = path.join(__dirname, '../../temp', `members-${Date.now()}.csv`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(filePath);
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    await exportMembersCSV(members, filePath);

    res.download(filePath, 'members.csv', (err) => {
      if (err) {
        console.error('Download error:', err);
      }
      // Clean up file after download
      setTimeout(() => {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }, 1000);
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to export members',
      error: error.message,
    });
  }
});

module.exports = router;

