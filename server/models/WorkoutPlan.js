const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  dayOfWeek: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true,
  },
  exercise: {
    type: String,
    required: true,
    trim: true,
  },
  reps: {
    type: String,
    trim: true,
  },
  sets: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
});

const workoutPlanSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  sessions: {
    type: [sessionSchema],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update updatedAt on save
workoutPlanSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('WorkoutPlan', workoutPlanSchema);

