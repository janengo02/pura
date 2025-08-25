const logger = require('../config/logger')
const crypto = require('crypto')

/**
 * Enhanced logger utility with contextual information
 * Provides structured logging with request correlation and user context
 */
class Logger {
  constructor() {
    this.logger = logger
  }

  /**
   * Create a child logger with context
   * @param {Object} context - Context object (userId, requestId, operation, etc.)
   * @returns {Object} Child logger with context
   */
  child(context = {}) {
    return {
      debug: (message, meta = {}) => this.debug(message, { ...context, ...meta }),
      info: (message, meta = {}) => this.info(message, { ...context, ...meta }),
      warn: (message, meta = {}) => this.warn(message, { ...context, ...meta }),
      error: (message, meta = {}) => this.error(message, { ...context, ...meta })
    }
  }

  /**
   * Generate a unique request ID
   * @returns {string} Unique request ID
   */
  generateRequestId() {
    return crypto.randomUUID()
  }

  /**
   * Debug level logging
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  debug(message, meta = {}) {
    this.logger.debug(message, {
      timestamp: new Date().toISOString(),
      ...meta
    })
  }

  /**
   * Info level logging
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  info(message, meta = {}) {
    this.logger.info(message, {
      timestamp: new Date().toISOString(),
      ...meta
    })
  }

  /**
   * Warning level logging
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   */
  warn(message, meta = {}) {
    this.logger.warn(message, {
      timestamp: new Date().toISOString(),
      ...meta
    })
  }

  /**
   * Error level logging with enhanced error context
   * @param {string} message - Log message
   * @param {Object} meta - Additional metadata
   * @param {Error} error - Error object (optional)
   */
  error(message, meta = {}, error = null) {
    const errorMeta = {
      timestamp: new Date().toISOString(),
      ...meta
    }

    if (error) {
      errorMeta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
        code: error.code,
        statusCode: error.statusCode,
        operation: error.operation,
        action: error.action,
        isOperational: error.isOperational
      }
    }

    this.logger.error(message, errorMeta)
  }

  /**
   * Log HTTP request
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {number} responseTime - Response time in milliseconds
   */
  logRequest(req, res, responseTime) {
    const meta = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
      requestId: req.requestId,
      userId: req.user ? req.user.id : null
    }

    const level = res.statusCode >= 400 ? 'warn' : 'info'
    const message = `${req.method} ${req.url} - ${res.statusCode} - ${responseTime}ms`

    this[level](message, meta)
  }

  /**
   * Log database operations
   * @param {string} operation - Database operation (CREATE, READ, UPDATE, DELETE)
   * @param {string} model - Model/table name
   * @param {Object} meta - Additional metadata
   */
  logDatabase(operation, model, meta = {}) {
    this.info(`Database ${operation}`, {
      operation,
      model,
      ...meta
    })
  }

  /**
   * Log authentication events
   * @param {string} event - Auth event (LOGIN, LOGOUT, TOKEN_REFRESH, etc.)
   * @param {Object} meta - Additional metadata
   */
  logAuth(event, meta = {}) {
    this.info(`Auth: ${event}`, {
      authEvent: event,
      ...meta
    })
  }

  /**
   * Log API operations with context
   * @param {string} operation - Operation type (task, group, page, etc.)
   * @param {string} action - Action performed (create, update, delete, etc.)
   * @param {Object} meta - Additional metadata
   */
  logOperation(operation, action, meta = {}) {
    this.info(`${operation.toUpperCase()}: ${action}`, {
      operation,
      action,
      ...meta
    })
  }
}

// Create singleton instance
const appLogger = new Logger()

module.exports = appLogger