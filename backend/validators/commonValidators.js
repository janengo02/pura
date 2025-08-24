const { param, body } = require('express-validator')

/**
 * Common validation rules that can be reused across different validators
 */

// MongoDB ObjectId validation for parameters
const validateObjectId = (fieldName, fieldLabel = 'ID') => {
   return param(fieldName)
      .isMongoId()
      .withMessage(`${fieldLabel} must be a valid ObjectId`)
}

// String validation with length constraints
const validateRequiredString = (
   fieldName,
   fieldLabel,
   minLength = 1,
   maxLength = 255
) => {
   return body(fieldName)
      .trim()
      .notEmpty()
      .withMessage(`${fieldLabel} is required`)
      .isLength({ min: minLength, max: maxLength })
      .withMessage(
         `${fieldLabel} must be between ${minLength} and ${maxLength} characters`
      )
}

// Optional string validation
const validateOptionalString = (
   fieldName,
   fieldLabel,
   minLength = 1,
   maxLength = 255
) => {
   return body(fieldName)
      .optional()
      .trim()
      .isLength({ min: minLength, max: maxLength })
      .withMessage(
         `${fieldLabel} must be between ${minLength} and ${maxLength} characters`
      )
}

// Email validation
const validateEmail = (fieldName = 'email') => {
   return body(fieldName)
      .trim()
      .normalizeEmail()
      .isEmail()
      .withMessage('Please provide a valid email address')
}

// Password validation
const validatePassword = (fieldName = 'password', minLength = 6) => {
   return body(fieldName)
      .isLength({ min: minLength })
      .withMessage(`Password must be at least ${minLength} characters long`)
}

// Numeric validation for parameters
const validateNumericParam = (fieldName, fieldLabel, min = 0) => {
   return param(fieldName)
      .isInt({ min })
      .withMessage(
         `${fieldLabel} must be a valid number greater than or equal to ${min}`
      )
      .toInt()
}

// Date validation
const validateDate = (fieldName, fieldLabel, optional = false) => {
   const validator = optional ? body(fieldName).optional() : body(fieldName)

   return validator
      .isISO8601({ strict: true })
      .withMessage(`${fieldLabel} must be a valid ISO 8601 date`)
      .toDate()
}

// Array validation
const validateArray = (
   fieldName,
   fieldLabel,
   minLength = 0,
   maxLength = 100
) => {
   return body(fieldName)
      .isArray({ min: minLength, max: maxLength })
      .withMessage(
         `${fieldLabel} must be an array with ${minLength}-${maxLength} items`
      )
}

// Enum validation
const validateEnum = (fieldName, fieldLabel, allowedValues) => {
   return body(fieldName)
      .isIn(allowedValues)
      .withMessage(`${fieldLabel} must be one of: ${allowedValues.join(', ')}`)
}

// Boolean validation
const validateBoolean = (fieldName, fieldLabel, optional = false) => {
   const validator = optional ? body(fieldName).optional() : body(fieldName)

   return validator
      .isBoolean()
      .withMessage(`${fieldLabel} must be a boolean value`)
      .toBoolean()
}

// URL validation
const validateURL = (fieldName, fieldLabel, optional = false) => {
   const validator = optional ? body(fieldName).optional() : body(fieldName)

   return validator
      .isURL({ require_protocol: true })
      .withMessage(`${fieldLabel} must be a valid URL`)
}

// Color hex validation
const validateHexColor = (fieldName, fieldLabel, optional = false) => {
   const validator = optional ? body(fieldName).optional() : body(fieldName)

   return validator
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage(`${fieldLabel} must be a valid hex color code`)
}

// Language code validation
const validateLanguage = (fieldName = 'language') => {
   return body(fieldName)
      .optional()
      .isIn(['en', 'ja'])
      .withMessage('Language must be either "en" or "ja"')
}

// Schedule validation (for task schedules)
const validateSchedule = (fieldName = 'schedule') => {
   return body(fieldName)
      .optional()
      .isArray()
      .withMessage('Schedule must be an array')
      .custom((schedule) => {
         if (!Array.isArray(schedule)) return false

         return schedule.every((slot) => {
            return (
               slot &&
               typeof slot === 'object' &&
               slot.startTime &&
               slot.endTime &&
               new Date(slot.startTime).getTime() <
                  new Date(slot.endTime).getTime()
            )
         })
      })
      .withMessage('Each schedule slot must have valid startTime and endTime')
}

module.exports = {
   validateObjectId,
   validateRequiredString,
   validateOptionalString,
   validateEmail,
   validatePassword,
   validateNumericParam,
   validateDate,
   validateArray,
   validateEnum,
   validateBoolean,
   validateURL,
   validateHexColor,
   validateLanguage,
   validateSchedule
}
