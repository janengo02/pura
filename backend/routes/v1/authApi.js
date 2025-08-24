const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const auth = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')
const {
   validateLogin,
   validateTokenRefresh
} = require('../../validators/authValidators')
const { asyncHandler } = require('../../utils/asyncHandler')
const {
   AuthenticationError,
   NotFoundError
} = require('../../utils/customErrors')
const prisma = require('../../config/prisma')

dotenv.config()

/**
 * @route GET api/auth
 * @desc Get authenticated user details
 * @access Private
 * @returns {Object} User details with email, name, avatar, googleAccounts
 */
router.get(
   '/',
   auth,
   asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })

      if (!user) {
         throw new NotFoundError('User not found', 'auth', 'access')
      }

      res.json({
         email: user.email,
         name: user.name,
         avatar: user.avatar,
         googleAccounts: user.googleAccounts.map((account) => ({
            _id: account._id,
            accountEmail: account.accountEmail,
            syncStatus: account.syncStatus,
            isDefault: account.isDefault
         }))
      })
   })
)

/**
 * @route POST api/auth
 * @desc Authenticate user and return JWT token
 * @access Public
 * @param {string} email
 * @param {string} password
 * @returns {Object} {token} on success, {errors} on validation error
 */
router.post(
   '/',
   validate(validateLogin),
   asyncHandler(async (req, res) => {
      const { email, password } = req.body

      // Check if user exists
      const user = await prisma.user.findUnique({
         where: { email }
      })

      if (!user) {
         throw new AuthenticationError('Invalid credentials', 'auth', 'login')
      }

      const isMatch = await bcrypt.compare(password, user.password)
      if (!isMatch) {
         throw new AuthenticationError('Invalid credentials', 'auth', 'login')
      }

      // Generate access token (15 minutes)
      const accessPayload = { user: { id: user.id } }
      const accessToken = jwt.sign(accessPayload, process.env?.JWT_SECRET, {
         expiresIn: 900
      })

      // Generate refresh token (7 days)
      const refreshTokenPayload = {
         user: { id: user.id },
         type: 'refresh',
         tokenId: crypto.randomBytes(16).toString('hex')
      }
      const refreshToken = jwt.sign(
         refreshTokenPayload,
         process.env?.JWT_SECRET,
         { expiresIn: '7d' }
      )

      // Store refresh token in database
      await prisma.user.update({
         where: { id: user.id },
         data: { userRefreshToken: refreshToken }
      })

      res.json({
         token: accessToken,
         refreshToken: refreshToken
      })
   })
)

/**
 * @route POST api/auth/refresh
 * @desc Refresh JWT token using refresh token
 * @access Public
 * @param {string} refreshToken
 * @returns {Object} {token, refreshToken} on success, {msg} on error
 */
router.post(
   '/refresh',
   validate(validateTokenRefresh),
   asyncHandler(async (req, res) => {
      const { refreshToken } = req.body

      // Verify and decode refresh token
      let decoded
      try {
         decoded = jwt.verify(refreshToken, process.env?.JWT_SECRET)
      } catch (err) {
         throw new AuthenticationError(
            'Invalid refresh token',
            'auth',
            'validate-refresh-token'
         )
      }

      // Validate refresh token structure
      if (!decoded.user?.id || decoded.type !== 'refresh') {
         throw new AuthenticationError(
            'Invalid refresh token format',
            'auth',
            'refresh-token-format'
         )
      }

      // Find user with this refresh token
      const user = await prisma.user.findFirst({
         where: {
            id: decoded.user.id,
            userRefreshToken: refreshToken
         }
      })

      if (!user) {
         throw new AuthenticationError(
            'Refresh token not found or expired',
            'auth',
            'get-refresh-token'
         )
      }

      // Generate new access token (15 minutes)
      const accessPayload = { user: { id: user.id } }
      const newAccessToken = jwt.sign(accessPayload, process.env?.JWT_SECRET, {
         expiresIn: 900
      })

      // Generate new refresh token (7 days)
      const newRefreshTokenPayload = {
         user: { id: user.id },
         type: 'refresh',
         tokenId: crypto.randomBytes(16).toString('hex')
      }
      const newRefreshToken = jwt.sign(
         newRefreshTokenPayload,
         process.env?.JWT_SECRET,
         { expiresIn: '7d' }
      )

      // Update refresh token in database
      await prisma.user.update({
         where: { id: user.id },
         data: { userRefreshToken: newRefreshToken }
      })

      res.json({
         token: newAccessToken,
         refreshToken: newRefreshToken
      })
   })
)

module.exports = router
