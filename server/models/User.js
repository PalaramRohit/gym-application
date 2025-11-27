const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['admin', 'trainer', 'member'],
    default: 'member',
  },
  phone: {
    type: String,
    trim: true,
  },
  dob: {
    type: Date,
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String,
  },
  profilePhotoUrl: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

module.exports = mongoose.model('User', userSchema);

