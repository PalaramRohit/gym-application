const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  planId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Plan',
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  paymentRef: {
    type: String,
    default: '', // Mock payment reference
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient queries
subscriptionSchema.index({ memberId: 1, status: 1 });

module.exports = mongoose.model('Subscription', subscriptionSchema);

