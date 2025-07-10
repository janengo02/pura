const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { check, validationResult } = require('express-validator')

const auth = require('../../middleware/auth')
const { sendErrorResponse } = require('../../utils/responseHelper')
const User = require('../../models/UserModel')

dotenv.config()

// @route   GET api/auth
// @desc    Retrieve authenticated user details including email, name, avatar, and linked Google accounts.
// @access  Private
router.get('/', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id).select('-password')
      if (user) {
         const { email, name, avatar, google_accounts } = user
         res.json({
            email,
            name,
            avatar,
            google_accounts: google_accounts.map((account) => ({
               _id: account._id,
               account_email: account.account_email,
               sync_status: account.sync_status,
               is_default: account.is_default
            }))
         })
      } else {
         sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error')
      }
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   POST api/auth
// @desc    Authenticate user by email and password, and return a JSON Web Token for session management.
// @access  Public
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
         const user = await User.findOne({ email })
         if (!user) {
            return sendErrorResponse(
               res,
               401,
               'alert-oops',
               'alert-invalid-email'
            )
         }

         const isMatch = await bcrypt.compare(password, user.password)
         if (!isMatch) {
            return sendErrorResponse(
               res,
               401,
               'alert-oops',
               'alert-invalid-password'
            )
         }

         // Return json web token
         const payload = { user: { id: user.id } }
         jwt.sign(
            payload,
            process.env?.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
               if (err) {
                  sendErrorResponse(
                     res,
                     500,
                     'alert-oops',
                     'alert-server_error',
                     err
                  )
               } else {
                  res.json({ token })
               }
            }
         )
      } catch (err) {
         sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
      }
   }
)

module.exports = router
