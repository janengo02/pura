/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {number} code - HTTP status code
 * @param {string} title - Error title key
 * @param {string} msg - Error message key
 * @param {Error} [error] - Optional error object for logging
 * @returns {Object} JSON error response
 */
const sendErrorResponse = (res, code, title, msg, error = null) => {
   if (error) {
      // @todo: Implement proper logging mechanism
      if (error.kind === 'ObjectId') {
         res.status(404).json({
            errors: [
               { code: 404, title: 'alert-oops', msg: 'alert-page-notfound' }
            ]
         })
         return
      }
   }
   res.status(code).json({
      errors: [{ code, title, msg }]
   })
}

module.exports = { sendErrorResponse }
