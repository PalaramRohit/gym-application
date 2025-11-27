const mongoose = require('mongoose');

const trainerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  bio: {
    type: String,
    trim: true,
  },
  specialty: {
    type: String,
    trim: true,
  },
  experienceYears: {
    type: Number,
    default: 0,
  },
  photoUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Trainer', trainerSchema);

