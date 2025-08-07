const express = require('express')
const dotenv = require('dotenv')
const router = express.Router()
const { google } = require('googleapis')

const auth = require('../../middleware/auth')
const User = require('../../models/UserModel')

const { sendErrorResponse } = require('../../utils/responseHelper')
const { setOAuthCredentials } = require('../../utils/calendarHelpers')

dotenv.config()

/**
 * @route POST api/google-meet/create-space
 * @desc Create Google Meet space via Calendar API
 * @access Private
 * @body {string} accountEmail, [config]
 * @returns {Object} {success, meetUri, spaceId, meetingCode, config, activeConference, createTime, updateTime}
 */
router.post('/create-space', auth, async (req, res) => {
   try {
      const { accountEmail, config = {} } = req.body

      if (!accountEmail) {
         return sendErrorResponse(res, 400, 'validation', 'failed')
      }

      // Note: Config validation removed since we're using Calendar API approach

      const user = await User.findById(req.user.id)
      const account = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      )

      if (!account) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

      // Use Google Calendar API to create Meet link (since google.meet API is not available)
      const oauth2Client = setOAuthCredentials(account.refresh_token)
      const calendar = google.calendar('v3')

      // Generate a unique conference ID
      const conferenceId = `meet_${Date.now()}_${Math.random()
         .toString(36)
         .substring(2, 11)}`

      // Generate conference data for Google Meet
      const conferenceData = {
         createRequest: {
            requestId: conferenceId,
            conferenceSolutionKey: {
               type: 'hangoutsMeet'
            }
         }
      }

      // Create a temporary event to generate the Meet link
      const tempEvent = {
         summary: 'Temporary Event for Meet Generation',
         start: {
            dateTime: new Date().toISOString()
         },
         end: {
            dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString() // 1 hour later
         },
         conferenceData: conferenceData
      }

      // Create temporary event with conference data
      const createdEvent = await calendar.events.insert({
         auth: oauth2Client,
         calendarId: 'primary',
         requestBody: tempEvent,
         conferenceDataVersion: 1
      })

      // Extract the generated Meet URI
      const meetUri = createdEvent.data.conferenceData?.entryPoints?.find(
         (entry) => entry.entryPointType === 'video'
      )?.uri

      const meetConferenceId = createdEvent.data.conferenceData?.conferenceId

      // Delete the temporary event
      await calendar.events.delete({
         auth: oauth2Client,
         calendarId: 'primary',
         eventId: createdEvent.data.id
      })

      if (!meetUri) {
         return sendErrorResponse(res, 500, 'google', 'sync')
      }

      res.json({
         success: true,
         meetUri: meetUri,
         spaceId: `spaces/${meetConferenceId}`,
         meetingCode: meetConferenceId,
         config: config,
         activeConference: null,
         createTime: new Date().toISOString(),
         updateTime: new Date().toISOString()
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route GET api/google-meet/space/:spaceId
 * @desc Get Google Meet space details (API not available)
 * @access Private
 * @param {string} spaceId
 * @query {string} accountEmail
 * @returns {Object} {success: false, message, error: 'API_NOT_AVAILABLE'}
 */
router.get('/space/:spaceId', auth, async (req, res) => {
   try {
      const { spaceId } = req.params
      const { accountEmail } = req.query

      if (!accountEmail) {
         return sendErrorResponse(res, 400, 'validation', 'failed')
      }

      const user = await User.findById(req.user.id)
      const account = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      )

      if (!account) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

      // Since Google Meet API v2 is not available, return a message
      res.json({
         success: false,
         message:
            'Google Meet space details cannot be retrieved. Google Meet API v2 is not available through googleapis library.',
         error: 'API_NOT_AVAILABLE'
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route PATCH api/google-meet/space/:spaceId
 * @desc Update Google Meet space (API not available)
 * @access Private
 * @param {string} spaceId
 * @body {string} accountEmail, {Object} config
 * @returns {Object} {success: false, message, error: 'API_NOT_AVAILABLE'}
 */
router.patch('/space/:spaceId', auth, async (req, res) => {
   try {
      const { spaceId } = req.params
      const { accountEmail, config } = req.body

      if (!accountEmail) {
         return sendErrorResponse(res, 400, 'validation', 'failed')
      }

      const user = await User.findById(req.user.id)
      const account = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      )

      if (!account) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

      // Since Google Meet API v2 is not available, return a message
      res.json({
         success: false,
         message:
            'Google Meet space updates are not supported. Google Meet API v2 is not available through googleapis library.',
         error: 'API_NOT_AVAILABLE'
      })
   } catch (err) {
      if (err.code === 404) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route DELETE api/google-meet/space/:spaceId
 * @desc Delete Google Meet space (API not available)
 * @access Private
 * @param {string} spaceId
 * @body {string} accountEmail
 * @returns {Object} {success: false, message, error: 'API_NOT_AVAILABLE'}
 */
router.delete('/space/:spaceId', auth, async (req, res) => {
   try {
      const { spaceId } = req.params
      const { accountEmail } = req.body

      if (!accountEmail) {
         return sendErrorResponse(res, 400, 'validation', 'failed')
      }

      const user = await User.findById(req.user.id)
      const account = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      )

      if (!account) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

      // Since Google Meet API v2 is not available, return a message
      res.json({
         success: false,
         message:
            'Google Meet space deletion is not supported. Google Meet API v2 is not available through googleapis library.',
         error: 'API_NOT_AVAILABLE'
      })
   } catch (err) {
      if (err.code === 404) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

module.exports = router
