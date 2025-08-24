const { body } = require('express-validator')
const {
   validateObjectId,
   validateOptionalString
} = require('./commonValidators')

/**
 * Progress validation schemas
 */

// Validate progress parameters
const validateProgressParams = [
   validateObjectId('pageId', 'Page ID'),
   validateObjectId('progressId', 'Progress ID')
]

// Create new progress validation
const validateCreateProgress = [
   validateObjectId('pageId', 'Page ID'),
   validateOptionalString('title', 'Progress title', 1, 50),
   body('color')
      .optional({ nullable: true })
      .isString()
      .withMessage('Color must be a string'),
   body('titleColor')
      .optional({ nullable: true })
      .isString()
      .withMessage('Title color must be a string')
]

// Update progress validation
const validateUpdateProgress = [
   ...validateProgressParams,
   validateOptionalString('title', 'Progress title', 1, 50),
   body('color')
      .optional({ nullable: true })
      .isString()
      .withMessage('Color must be a string'),
   body('titleColor')
      .optional({ nullable: true })
      .isString()
      .withMessage('Title color must be a string')
]

module.exports = {
   validateProgressParams,
   validateCreateProgress,
   validateUpdateProgress
}
