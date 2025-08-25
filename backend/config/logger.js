const winston = require('winston')
const DailyRotateFile = require('winston-daily-rotate-file')
const path = require('path')

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json()
)

// Define console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let metaString = ''
    if (Object.keys(meta).length > 0) {
      metaString = '\n' + JSON.stringify(meta, null, 2)
    }
    return `${timestamp} [${level}]: ${message}${metaString}`
  })
)

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs')

// Define transports
const transports = []

// Console transport - always include for Railway logs
transports.push(
  new winston.transports.Console({
    format: process.env.NODE_ENV === 'production' ? logFormat : consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug'
  })
)

// Production: Railway built-in logging is sufficient - no file logging needed
const useFileLogging = process.env.NODE_ENV !== 'production'

// File transport for all logs
const fileTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'application-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
  level: process.env.LOG_LEVEL || 'info'
})

// File transport for error logs only
const errorTransport = new DailyRotateFile({
  filename: path.join(logsDir, 'error-%DATE%.log'),
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
  level: 'error'
})

// Only add file transports if enabled (not on Railway by default)
if (useFileLogging) {
  transports.push(fileTransport, errorTransport)
}

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  transports,
  // Handle exceptions and rejections - only file logging if enabled
  ...(useFileLogging && {
    exceptionHandlers: [
      new DailyRotateFile({
        filename: path.join(logsDir, 'exceptions-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: logFormat
      })
    ],
    rejectionHandlers: [
      new DailyRotateFile({
        filename: path.join(logsDir, 'rejections-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        format: logFormat
      })
    ]
  })
})

// Create logs directory only if file logging is enabled
if (useFileLogging) {
  fileTransport.on('new', () => {
    const fs = require('fs')
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true })
    }
  })
}

module.exports = logger