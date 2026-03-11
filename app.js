const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const { logger } = require('./config/logger');
const { notFound, errorHandler } = require('./middlewares/error-handler');

const authRoutes     = require('./routes/auth.routes');
const categoryRoutes = require('./routes/category.routes');
const carRoutes      = require('./routes/car.routes');
const profileRoutes  = require('./routes/profile.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Morgan -> winston
app.use(
  morgan('combined', {
    stream: {
      write: (message) => {
        try {
          logger.info(message.trim());
        } catch (err) {
          console.log(message.trim());
        }
      },
    },
  })
);

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cars', carRoutes);
app.use('/api/profile', profileRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server ishlayapti',
    timestamp: new Date(),
  });
});

// Error handlers
app.use(notFound);
app.use(errorHandler);

module.exports = app;