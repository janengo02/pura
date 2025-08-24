const { body } = require('express-validator')
const {
   validateEmail,
   validatePassword,
   validateRequiredString
} = require('./commonValidators')

/**
 * Authentication validation schemas
 */

// Login validation
const validateLogin = [
   validateEmail('email'),
   validatePassword('password', 1) // Minimum 1 character for login (existing passwords)
]

// Registration validation
const validateRegistration = [
   validateRequiredString('name', 'Name', 2, 50),
   validateEmail('email'),
   validatePassword('password', 6), // Minimum 6 characters for new passwords
   body('language')
      .optional()
      .isIn(['en', 'ja'])
      .withMessage('Language must be either "en" or "ja"')
]

// Token refresh validation
const validateTokenRefresh = [
   body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
      .isJWT()
      .withMessage('Refresh token must be a valid JWT')
]

module.exports = {
   validateLogin,
   validateRegistration,
   validateTokenRefresh
}
