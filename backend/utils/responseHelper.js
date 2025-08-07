/**
 * Get contextual error messages based on operation and HTTP status
 * @param {string} operation - The operation that failed (task, schedule, auth, etc.)
 * @param {string} action - The action attempted (create, update, delete, etc.)
 * @param {number} statusCode - HTTP status code
 * @returns {Object} Error message keys { title, msg, description }
 */
const getContextualError = (operation, action, statusCode = 500) => {
   const baseKey = `error-${operation}-${action}-failed`
   const descKey = `${baseKey}-desc`

   // Handle specific status codes
   if (statusCode === 404) {
      return {
         title: `error-${operation}-not-found`,
         msg: `error-${operation}-not-found-desc`
      }
   }

   if (statusCode === 403) {
      return {
         title: 'error-page-access-denied',
         msg: 'error-page-access-denied-desc'
      }
   }

   if (statusCode === 401 && operation !== 'auth') {
      return {
         title: 'error-auth-access-failed',
         msg: 'error-auth-access-failed-desc'
      }
   }

   if (statusCode === 400) {
      return {
         title: 'error-validation-failed',
         msg: 'error-validation-failed-desc'
      }
   }

   // Default operational error
   return {
      title: baseKey,
      msg: descKey
   }
}

/**
 * Send enhanced error response with contextual messaging
 * @param {Object} res - Express response object
 * @param {number} code - HTTP status code
 * @param {string} operation - Operation type (task, schedule, auth, etc.)
 * @param {string} action - Action attempted (create, update, delete, etc.)
 * @param {Error} [error] - Optional error object for logging
 * @returns {Object} JSON error response
 */
const sendErrorResponse = (res, code, operation, action, error = null) => {
   const errorMessages = getContextualError(operation, action, code)
   // Build error response object
   const errorResponse = {
      code,
      title: errorMessages.title,
      msg: errorMessages.msg
   }
   console.error(`Error: ${errorMessages.title} - ${errorMessages.msg}`)
   if (error) {
      console.error('Error details:', error)
   }

   res.status(code).json({
      errors: [errorResponse]
   })
}

module.exports = { sendErrorResponse }
