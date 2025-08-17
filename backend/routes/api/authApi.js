const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
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

         // Return json web token
         const payload = { user: { id: user.id } }
         jwt.sign(
            payload,
            process.env?.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
               if (err) {
                  throw Error('Token generation failed')
               } else {
                  res.json({ token })
               }
            }
         )
      } catch (err) {
         sendErrorResponse(res, 500, 'auth', 'login', err)
      }
   }
)

module.exports = router
