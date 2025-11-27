const mongoose = require('mongoose');

const planSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Plan name is required'],
    trim: true,
  },
  durationInDays: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 1,
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0,
  },
  perks: {
    type: [String],
    default: [],
  },
  maxSessionsPerWeek: {
    type: Number,
    default: null, // null means unlimited
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Plan', planSchema);

