module.exports = {
  secret: process.env.JWT_SECRET || 'fallback_secret_change_in_production',
  expiresIn: process.env.JWT_EXPIRE || '7d',
};

