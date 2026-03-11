const { createLogger, format, transports } = require("winston");
const path = require("path");
require("dotenv").config();

const { combine, timestamp, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = createLogger({
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [
    // Console log
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat
      ),
    }),

    // All logs
    new transports.File({
      filename: path.join(__dirname, "../logs/combined.log"),
      level: "info",
    }),

    // Error logs
    new transports.File({
      filename: path.join(__dirname, "../logs/error.log"),
      level: "error",
    }),

    // Warning logs
    new transports.File({
      filename: path.join(__dirname, "../logs/warn.log"),
      level: "warn",
    }),
  ],
  exceptionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../logs/exceptions.log"),
    }),
  ],
  rejectionHandlers: [
    new transports.File({
      filename: path.join(__dirname, "../logs/rejections.log"),
    }),
  ],
});

// MongoDB log transport
const addMongoTransport = (mongoUri) => {
  try {
    require("winston-mongodb");

    logger.add(
      new transports.MongoDB({
        db: mongoUri,
        collection: "logs",
        level: "info",
        tryReconnect: true,
      })
    );

    logger.info("MongoDB log transport connected");
  } catch (err) {
    logger.warn("MongoDB transport error: " + err.message);
  }
};

module.exports = { logger, addMongoTransport };