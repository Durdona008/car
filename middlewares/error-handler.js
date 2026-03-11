const { logger } = require('../config/logger');

// 404 handler
const notFound = (req, res, next) => {
  const error = new Error(`Route topilmadi: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || err.status || 500;
  const message = err.message || 'Server xatosi';

  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`, {
      stack: err.stack,
      body: req.body,
      user: req.user ? req.user._id : 'guest',
    });
  } else if (statusCode >= 400) {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`);
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Fayl hajmi 5MB dan oshmasligi kerak',
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(409).json({
      success: false,
      message: `${field} allaqachon mavjud`,
    });
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ success: false, message: 'Validatsiya xatosi', errors });
  }

  // CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({ success: false, message: 'Noto\'g\'ri ID format' });
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { notFound, errorHandler };