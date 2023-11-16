const winston = require('winston');

// Configure the logger
const logger = winston.createLogger({
  level: 'info', // Set the default log level
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.simple()
  ),
  transports: [
    new winston.transports.Console(), // Log to the console
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }) // Log errors to a file
  ]
});

module.exports = logger;
