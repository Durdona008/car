require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { logger } = require('./config/logger');

const PORT = process.env.PORT || 3000;

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server ${PORT}-portda ishga tushdi | NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();