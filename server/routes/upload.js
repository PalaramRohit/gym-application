const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const { handleUpload } = require('../middleware/upload');

// @route   POST /api/upload/profile-photo
// @desc    Upload profile photo
// @access  Private
router.post('/profile-photo', authenticate, handleUpload('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const photoUrl = req.file.url || `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        url: photoUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

// @route   POST /api/upload/checkin-photo
// @desc    Upload check-in photo
// @access  Private
router.post('/checkin-photo', authenticate, handleUpload('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const photoUrl = req.file.url || `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      message: 'Photo uploaded successfully',
      data: {
        url: photoUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
});

module.exports = router;

