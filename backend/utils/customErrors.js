/**
 * Custom Error Classes for Standardized Error Handling
 * These classes extend the base Error class to provide consistent error types
 * with appropriate HTTP status codes and error categorization
 */

/**
 * Base Application Error class
 * All custom errors should extend this class
 */
class AppError extends Error {
   constructor(message, statusCode, operation = null, action = null, isOperational = true) {
      super(message)
      
      this.statusCode = statusCode
      this.operation = operation
      this.action = action
      this.isOperational = isOperational
      this.status = statusCode >= 400 && statusCode < 500 ? 'fail' : 'error'
      
      Error.captureStackTrace(this, this.constructor)
   }
}

/**
 * Validation Error - 400 Bad Request
 * Used for input validation failures
 */
class ValidationError extends AppError {
   constructor(message = 'Validation failed', operation = 'validation', action = 'validate', details = null) {
      super(message, 400, operation, action)
      this.name = 'ValidationError'
      this.details = details
   }
}

/**
 * Authentication Error - 401 Unauthorized
 * Used for authentication failures (invalid credentials, missing tokens)
 */
class AuthenticationError extends AppError {
   constructor(message = 'Authentication failed', operation = 'auth', action = 'authenticate') {
      super(message, 401, operation, action)
      this.name = 'AuthenticationError'
   }
}

/**
 * Authorization Error - 403 Forbidden
 * Used for authorization failures (insufficient permissions)
 */
class AuthorizationError extends AppError {
   constructor(message = 'Access denied', operation = 'auth', action = 'authorize') {
      super(message, 403, operation, action)
      this.name = 'AuthorizationError'
   }
}

/**
 * Not Found Error - 404 Not Found
 * Used when requested resources don't exist
 */
class NotFoundError extends AppError {
   constructor(message = 'Resource not found', operation = 'resource', action = 'find') {
      super(message, 404, operation, action)
      this.name = 'NotFoundError'
   }
}

/**
 * Database Error - 500 Internal Server Error
 * Used for database operation failures
 */
class DatabaseError extends AppError {
   constructor(message = 'Database operation failed', operation = 'database', action = 'operation') {
      super(message, 500, operation, action)
      this.name = 'DatabaseError'
   }
}

/**
 * Conflict Error - 409 Conflict
 * Used for resource conflicts (duplicate entries, constraint violations)
 */
class ConflictError extends AppError {
   constructor(message = 'Resource conflict', operation = 'resource', action = 'create') {
      super(message, 409, operation, action)
      this.name = 'ConflictError'
   }
}

/**
 * Rate Limit Error - 429 Too Many Requests
 * Used for rate limiting violations
 */
class RateLimitError extends AppError {
   constructor(message = 'Rate limit exceeded', operation = 'request', action = 'limit') {
      super(message, 429, operation, action)
      this.name = 'RateLimitError'
   }
}

/**
 * External Service Error - 502 Bad Gateway
 * Used for third-party service failures
 */
class ExternalServiceError extends AppError {
   constructor(message = 'External service unavailable', operation = 'external', action = 'request') {
      super(message, 502, operation, action)
      this.name = 'ExternalServiceError'
   }
}

module.exports = {
   AppError,
   ValidationError,
   AuthenticationError,
   AuthorizationError,
   NotFoundError,
   DatabaseError,
   ConflictError,
   RateLimitError,
   ExternalServiceError
}