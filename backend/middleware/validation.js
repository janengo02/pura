const { validationResult } = require('express-validator')
const { sendErrorResponse } = require('../utils/responseHelper')

/**
 * Centralized validation middleware
 * Handles express-validator validation results and returns consistent error responses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const handleValidation = (req, res, next) => {
   const errors = validationResult(req)

   if (!errors.isEmpty()) {
      // Format validation errors for consistent response
      const validationErrors = errors.array().map((error) => ({
         field: error.path || error.param,
         message: error.msg,
         value: error.value,
         location: error.location
      }))

      return sendErrorResponse(
         res,
         400,
         'error-validation-failed',
         'error-validation-failed-desc',
         validationErrors
      )
   }

   next()
}

/**
 * Wrapper function to create validation middleware chains
 * @param {Array} validators - Array of express-validator validation chains
 * @returns {Array} Array containing validators and validation handler
 */
const validate = (validators) => {
   return [...validators, handleValidation]
}

module.exports = {
   handleValidation,
   validate
}
