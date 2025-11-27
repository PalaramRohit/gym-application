const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  checkinAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  method: {
    type: String,
    enum: ['web', 'manual', 'photo'],
    default: 'web',
  },
  photoUrl: {
    type: String,
    default: '',
  },
  notes: {
    type: String,
    trim: true,
  },
});

// Indexes for efficient queries
attendanceSchema.index({ memberId: 1, checkinAt: -1 });
attendanceSchema.index({ trainerId: 1, checkinAt: -1 });
attendanceSchema.index({ checkinAt: -1 });

module.exports = mongoose.model('Attendance', attendanceSchema);

