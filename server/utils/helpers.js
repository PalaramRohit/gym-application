// Utility helper functions

// Calculate days between two dates
const daysBetween = (date1, date2) => {
  const oneDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs((date1 - date2) / oneDay));
};

// Format date to YYYY-MM-DD
const formatDate = (date) => {
  return new Date(date).toISOString().split('T')[0];
};

// Get start and end of day
const getDayRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// Get start and end of month
const getMonthRange = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0, 23, 59, 59, 999);
  return { start, end };
};

// Validate email format
const isValidEmail = (email) => {
  return /^\S+@\S+\.\S+$/.test(email);
};

// Sanitize string input
const sanitizeString = (str) => {
  if (typeof str !== 'string') return str;
  return str.trim().replace(/[<>]/g, '');
};

module.exports = {
  daysBetween,
  formatDate,
  getDayRange,
  getMonthRange,
  isValidEmail,
  sanitizeString,
};

