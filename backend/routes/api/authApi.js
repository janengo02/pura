const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs')

const User = require('../../models/UserModel')
const dotenv = require('dotenv')

dotenv.config()
// @route   GET api/auth
// @desc    Authenticate user
// @access  Public
router.get('/', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id).select('-password')
      if (typeof user !== 'undefined' && user) {
         const { email, name, avatar, google_accounts } = user
         res.json({
            email,
            name,
            avatar,
            google_accounts: google_accounts.map((account) => {
               return {
                  _id: account._id,
                  account_email: account.account_email,
                  sync_status: account.sync_status
               }
            })
         })
      } else {
         res.status(500).json({
            errors: [
               { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
            ]
         })
      }
   } catch (err) {
      console.error('---ERROR---: ' + err.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   POST api/auth
// @desc    Login & get Token
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
         let user = await User.findOne({ email })
         if (!user) {
            return res.status(400).json({
               errors: [
                  {
                     code: '400',
                     title: 'alert-oops',
                     msg: 'alert-invalid-email'
                  }
               ]
            })
         }

         const isMatch = await bcrypt.compare(password, user.password)

         if (!isMatch) {
            return res.status(400).json({
               errors: [
                  {
                     code: '400',
                     title: 'alert-oops',
                     msg: 'alert-invalid-password'
                  }
               ]
            })
         }

         // Return json web token
         const payload = {
            user: {
               id: user.id
            }
         }

         jwt.sign(
            payload,
            process.env?.JWT_SECRET,
            { expiresIn: 360000 },
            (err, token) => {
               if (err) throw err
               res.json({ token })
            }
         )
      } catch (err) {
         console.error('---ERROR---: ' + err.message)
         res.status(500).json({
            errors: [
               { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
            ]
         })
      }
   }
)

module.exports = router
