const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uriFromEnv = process.env.MONGO_URI && typeof process.env.MONGO_URI === 'string' ? process.env.MONGO_URI.trim() : '';
    const uri = uriFromEnv || 'mongodb://127.0.0.1:27017/gym-management';
    if (!uriFromEnv) {
      console.warn('MONGO_URI not found in env. Using local default mongodb://127.0.0.1:27017/gym-management');
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

