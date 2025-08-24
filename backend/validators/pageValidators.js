const { body } = require('express-validator')
const {
   validateObjectId,
   validateOptionalString
} = require('./commonValidators')

/**
 * Page validation schemas
 */

// Validate page ID parameter
const validatePageParam = [validateObjectId('id', 'Page ID')]

// Create new page validation
const validateCreatePage = [validateOptionalString('title', 'Title', 1, 100)]

// Move task between pages validation
const validateDropTask = [
   validateObjectId('id', 'Page ID'),
   body('result').isObject().withMessage('Result must be an object'),
   body('result.destination')
      .isObject()
      .withMessage('Destination must be an object'),
   body('result.source').isObject().withMessage('Source must be an object'),
   body('result.draggableId')
      .notEmpty()
      .withMessage('Draggable ID is required')
      .isString()
      .withMessage('Draggable ID must be a valid string')
]

module.exports = {
   validatePageParam,
   validateCreatePage,
   validateDropTask
}
