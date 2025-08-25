const { sendErrorResponse } = require('../utils/responseHelper')
const { AppError } = require('../utils/customErrors')
const logger = require('../utils/logger')

/**
 * Global Error Handler Middleware
 * Centralized error handling for the entire application
 * Must be placed after all routes in server.js
 */

/**
 * Handle different types of errors and convert them to operational errors
 * @param {Error} error - The error object
 * @returns {AppError} Operational error with appropriate status code
 */
const handleKnownErrors = (error) => {
   // Handle Mongoose validation errors
   if (error.name === 'ValidationError' && error.errors) {
      const message = Object.values(error.errors)
         .map((val) => val.message)
         .join(', ')
      return new AppError(message, 400, 'validation', 'validate')
   }

   // Handle Mongoose duplicate key errors
   if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0]
      const message = `Duplicate value for field: ${field}`
      return new AppError(message, 409, 'database', 'create')
   }

   // Handle Mongoose cast errors
   if (error.name === 'CastError') {
      const message = `Invalid ${error.path}: ${error.value}`
      return new AppError(message, 400, 'database', 'find')
   }

   // Handle JWT errors
   if (error.name === 'JsonWebTokenError') {
      return new AppError('Invalid token', 401, 'auth', 'verify')
   }

   if (error.name === 'TokenExpiredError') {
      return new AppError('Token expired', 401, 'auth', 'verify')
   }

   // Handle Prisma errors
   if (error.code && error.code.startsWith('P')) {
      return handlePrismaError(error)
   }

   // Return original error if it's already an operational error
   if (error.isOperational) {
      return error
   }

   // For unknown errors, create a generic operational error
   return new AppError('Something went wrong', 500, 'system', 'unknown')
}

/**
 * Handle Prisma-specific errors
 * @param {Error} error - Prisma error object
 * @returns {AppError} Formatted application error
 */
const handlePrismaError = (error) => {
   switch (error.code) {
      case 'P2002':
         return new AppError(
            'Duplicate entry. Resource already exists',
            409,
            'database',
            'create'
         )
      case 'P2025':
         return new AppError('Record not found', 404, 'database', 'find')
      case 'P2003':
         return new AppError(
            'Foreign key constraint failed',
            400,
            'database',
            'constraint'
         )
      case 'P2021':
         return new AppError('Table does not exist', 500, 'database', 'schema')
      default:
         return new AppError(
            'Database operation failed',
            500,
            'database',
            'operation'
         )
   }
}

/**
 * Send error response in development mode
 * Includes full error details and stack trace
 * @param {AppError} err - The operational error
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, res) => {
   logger.error(
      'Error details in development mode',
      {
         name: err.name,
         message: err.message,
         statusCode: err.statusCode,
         status: err.status,
         operation: err.operation,
         action: err.action,
         stack: err.stack,
         details: err.details
      },
      err
   )

   // Use existing responseHelper for consistent format
   sendErrorResponse(res, err.statusCode, err.operation, err.action, {
      message: err.message,
      stack: err.stack,
      details: err.details
   })
}

/**
 * Send error response in production mode
 * Only sends operational errors to client, hides system errors
 * @param {AppError} err - The operational error
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, res) => {
   logger.error(
      'Error details in production mode',
      {
         name: err.name,
         message: err.message,
         statusCode: err.statusCode,
         status: err.status,
         operation: err.operation,
         action: err.action,
         stack: err.stack,
         details: err.details
      },
      err
   )
   // Operational, trusted error: send message to client
   if (err.isOperational) {
      // Use existing responseHelper for consistent format
      sendErrorResponse(res, err.statusCode, err.operation, err.action, err)
   } else {
      // Programming or other unknown error: don't leak error details
      sendErrorResponse(
         res,
         500,
         'system',
         'error',
         new Error('Something went wrong')
      )
   }
}

/**
 * Global error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
   // Convert error to operational error
   let error = handleKnownErrors(err)

   // Set default status code if not set
   error.statusCode = error.statusCode || 500
   error.status = error.status || 'error'

   // Send appropriate response based on environment
   if (process.env.NODE_ENV === 'development') {
      sendErrorDev(error, res)
   } else {
      sendErrorProd(error, res)
   }
}

/**
 * Handle 404 errors for undefined routes
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const notFoundHandler = (req, res, next) => {
   const err = new AppError(
      `Route ${req.originalUrl} not found`,
      404,
      'route',
      'find'
   )
   next(err)
}

module.exports = {
   globalErrorHandler,
   notFoundHandler,
   handleKnownErrors,
   handlePrismaError
}
