const jwt = require('jsonwebtoken')
const dotenv = require('dotenv')
const { AuthenticationError } = require('../utils/customErrors')

dotenv.config()
module.exports = function (req, res, next) {
   // Get token from header
   const token = req.header('x-auth-token')

   // Check if no token
   if (!token) {
      return next(new AuthenticationError('Access denied. No token provided', 'auth', 'get-refresh-token'))
   }

   // Verify token
   try {
      const decoded = jwt.verify(token, process.env?.JWT_SECRET)

      req.user = decoded.user
      next()
   } catch (err) {
      return next(new AuthenticationError('Token is not valid', 'auth', 'validate-refresh-token'))
   }
}
