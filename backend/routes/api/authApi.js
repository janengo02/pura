const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const { check, validationResult } = require('express-validator')

const auth = require('../../middleware/auth')
const { sendErrorResponse } = require('../../utils/responseHelper')
const prisma = require('../../config/prisma')

dotenv.config()

/**
 * @route GET api/auth
 * @desc Get authenticated user details
 * @access Private
 * @returns {Object} User details with email, name, avatar, googleAccounts
 */
router.get('/', auth, async (req, res) => {
   try {
      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })
      if (user) {
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
      } else {
         throw new Error('User not found')
      }
   } catch (err) {
      sendErrorResponse(res, 500, 'auth', 'access', err)
   }
})

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
   [
      check('email', 'Please include a valid email').isEmail(),
      check('password', 'Password is required').exists()
   ],
   async (req, res) => {
      const result = validationResult(req)
      if (!result.isEmpty()) {
         return res.status(400).json({ errors: result.array() })
      }
      const { email, password } = req.body

      try {
         // Check if user exists
         const user = await prisma.user.findUnique({
            where: { email }
         })
         if (!user) {
            return sendErrorResponse(res, 401, 'auth', 'login')
         }

         const isMatch = await bcrypt.compare(password, user.password)
         if (!isMatch) {
            return sendErrorResponse(res, 401, 'auth', 'login')
         }

         // Generate access token (15 minutes)
         const accessPayload = { user: { id: user.id } }
         const accessToken = jwt.sign(
            accessPayload,
            process.env?.JWT_SECRET,
            { expiresIn: 900 }
         )

         // Generate refresh token (7 days)
         const refreshToken = crypto.randomBytes(32).toString('hex')
         
         // Store refresh token in database
         await prisma.user.update({
            where: { id: user.id },
            data: { jwtRefreshToken: refreshToken }
         })

         res.json({ 
            token: accessToken,
            refreshToken: refreshToken
         })
      } catch (err) {
         sendErrorResponse(res, 500, 'auth', 'login', err)
      }
   }
)

/**
 * @route POST api/auth/refresh
 * @desc Refresh JWT token using refresh token
 * @access Public
 * @param {string} refreshToken
 * @returns {Object} {token, refreshToken} on success, {msg} on error
 */
router.post('/refresh', async (req, res) => {
   try {
      const { refreshToken } = req.body

      if (!refreshToken) {
         return res.status(401).json({ msg: 'Refresh token required' })
      }

      // Find user with this refresh token
      const user = await prisma.user.findFirst({
         where: { jwtRefreshToken: refreshToken }
      })

      if (!user) {
         return res.status(401).json({ msg: 'Invalid refresh token' })
      }

      // Generate new access token (15 minutes)
      const accessPayload = { user: { id: user.id } }
      const newAccessToken = jwt.sign(
         accessPayload,
         process.env?.JWT_SECRET,
         { expiresIn: 900 }
      )

      // Generate new refresh token
      const newRefreshToken = crypto.randomBytes(32).toString('hex')
      
      // Update refresh token in database
      await prisma.user.update({
         where: { id: user.id },
         data: { jwtRefreshToken: newRefreshToken }
      })

      res.json({
         token: newAccessToken,
         refreshToken: newRefreshToken
      })

   } catch (err) {
      sendErrorResponse(res, 500, 'auth', 'refresh', err)
   }
})

module.exports = router
