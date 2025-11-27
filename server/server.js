const path = require('path');
const fs = require('fs');
const envPath = path.join(__dirname, '../.env');
console.log('Attempting to load .env from:', envPath, 'exists?', fs.existsSync(envPath));
require('dotenv').config({ path: envPath });
console.log('TRAINER_INVITE_CODE present?', Boolean(process.env.TRAINER_INVITE_CODE));
console.log('ADMIN_INVITE_CODE present?', Boolean(process.env.ADMIN_INVITE_CODE));
console.log('TRAINER_INVITE_CODE value:', process.env.TRAINER_INVITE_CODE || 'NOT SET');
console.log('ADMIN_INVITE_CODE value:', process.env.ADMIN_INVITE_CODE || 'NOT SET');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Connect to database
console.log('MONGO_URI present?', Boolean(process.env.MONGO_URI));
connectDB();

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
const corsOptions = process.env.NODE_ENV === 'production'
  ? {
      origin: process.env.CORS_ORIGIN
        ? process.env.CORS_ORIGIN.split(',')
        : ['http://localhost:3000'],
      credentials: true,
    }
  : {
      origin: function (origin, callback) {
        callback(null, true);
      },
      credentials: true,
    };
app.use(cors(corsOptions));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per window
  // Return a JSON error body so frontend can parse it
  handler: (req, res /*, next */) => {
    res.status(429).json({ success: false, message: 'Too many login attempts, please try again later' });
  },
  message: 'Too many login attempts, please try again later',
});

// Serve static files (uploads)
const uploadsPath = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Serve frontend static files from `public` if present
const publicPath = path.join(__dirname, '../public');
if (fs.existsSync(publicPath)) {
  app.use(express.static(publicPath));
}

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/trainers', require('./routes/trainers'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/workout-plans', require('./routes/workout-plans'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/upload', require('./routes/upload'));
app.use('/api/reports', require('./routes/reports'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

// Fallback to `index.html` for non-API routes (useful for SPA/front-end files)
if (fs.existsSync(publicPath)) {
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(publicPath, 'index.html'));
  });
}

// Error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

