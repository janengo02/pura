const { body } = require('express-validator')
const {
   validateObjectId,
   validateOptionalString
} = require('./commonValidators')

/**
 * Group validation schemas
 */

// Validate group parameters
const validateGroupParams = [
   validateObjectId('pageId', 'Page ID'),
   validateObjectId('groupId', 'Group ID')
]

// Create new group validation
const validateCreateGroup = [
   validateObjectId('pageId', 'Page ID'),
   validateOptionalString('title', 'Group title', 1, 50),
   body('color')
      .optional({ nullable: true })
      .isString()
      .withMessage('Color must be a string')
]

// Update group validation
const validateUpdateGroup = [
   ...validateGroupParams,
   validateOptionalString('title', 'Group title', 1, 50),
   body('color')
      .optional({ nullable: true })
      .isString()
      .withMessage('Color must be a string')
]

module.exports = {
   validateGroupParams,
   validateCreateGroup,
   validateUpdateGroup
}
