const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { google } = require('googleapis')

const User = require('../../models/User')

const GOOGLE_CLIENT_ID =
   '468371290571-ul1g9cfmv5gvk8plu5lh32tomo20s767.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
const APP_PATH = 'http://localhost:2000'

const oath2Client = new google.auth.OAuth2(
   GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET,
   APP_PATH
)
// @route   POST api/google-account/create-tokens
// @desc    Create Google Account Auth Tokens
// @access  Private
router.post('/create-tokens', auth, async (req, res) => {
   try {
      const { code } = req.body
      const { tokens } = await oath2Client.getToken(code)
      const { refresh_token } = tokens
      const user = await User.findOneAndUpdate(
         { _id: req.user.id },
         {
            $set: {
               google_refresh_token: refresh_token,
               update_date: new Date()
            }
         },
         { new: true }
      )
   } catch (err) {
      console.error('---ERROR---: ' + err.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   POST api/google-account/create-event
// @desc    Create Google Event
// @access  Private
router.post('/create-event', auth, async (req, res) => {
   try {
   } catch (err) {
      console.error('---ERROR---: ' + err.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

module.exports = router
