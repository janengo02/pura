/**
 * Async Error Handler Wrapper
 * Eliminates the need for try/catch blocks in async route handlers
 * Automatically catches and forwards errors to the global error handler
 */

/**
 * Wraps async route handlers to catch errors and pass them to next()
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped route handler
 *
 * Usage:
 * router.get('/route', asyncHandler(async (req, res, next) => {
 *    // Your async code here
 *    // Any thrown errors will be automatically caught and passed to error handler
 * }))
 */
const asyncHandler = (fn) => {
   return (req, res, next) => {
      // Execute the function and catch any errors
      Promise.resolve(fn(req, res, next)).catch(next)
   }
}

module.exports = {
   asyncHandler
}
