const express = require('express')
const dotenv = require('dotenv')
const router = express.Router()
const { google } = require('googleapis')

const auth = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')
const {
   validateCreateMeeting,
   validateUpdateMeeting,
   validateDeleteMeeting
} = require('../../validators/calendarValidators')
const prisma = require('../../config/prisma')

const { asyncHandler } = require('../../utils/asyncHandler')
const {
   ValidationError,
   NotFoundError,
   ExternalServiceError
} = require('../../utils/customErrors')
const { decrypt, isEncrypted } = require('../../utils/encryption')
const { setOAuthCredentials } = require('../../utils/calendarHelpers')

dotenv.config()

/**
 * @route POST api/google-meet/create-space
 * @desc Create Google Meet space via Calendar API
 * @access Private
 * @body {string} accountEmail, [config]
 * @returns {Object} {success, meetUri, spaceId, meetingCode, config, activeConference, createTime, updateTime}
 */
router.post(
   '/create-space',
   auth,
   validate(validateCreateMeeting),
   asyncHandler(async (req, res) => {
      const { accountEmail, config = {} } = req.body

      if (!accountEmail) {
         throw new ValidationError(
            'Account email is required',
            'validation',
            'failed'
         )
      }

      // Note: Config validation removed since we're using Calendar API approach

      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })
      const account = user.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      )

      if (!account) {
         throw new NotFoundError('Google account not found', 'google', 'access')
      }

      // Decrypt the refresh token before use
      const refreshToken = isEncrypted(account.refreshToken)
         ? decrypt(account.refreshToken)
         : account.refreshToken

      // Use Google Calendar API to create Meet link (since google.meet API is not available)
      const oauth2Client = setOAuthCredentials(refreshToken)
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
         throw new ExternalServiceError(
            'Failed to generate Google Meet link',
            'google',
            'sync'
         )
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
   })
)

/**
 * @route GET api/google-meet/space/:spaceId
 * @desc Get Google Meet space details (API not available)
 * @access Private
 * @param {string} spaceId
 * @query {string} accountEmail
 * @returns {Object} {success: false, message, error: 'API_NOT_AVAILABLE'}
 */
router.get(
   '/space/:spaceId',
   auth,
   asyncHandler(async (req, res) => {
      const { spaceId } = req.params
      const { accountEmail } = req.query

      if (!accountEmail) {
         throw new ValidationError(
            'Account email is required',
            'validation',
            'failed'
         )
      }

      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })
      const account = user.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      )

      if (!account) {
         throw new NotFoundError('Google account not found', 'google', 'access')
      }

      // Since Google Meet API v2 is not available, return a message
      res.json({
         success: false,
         message:
            'Google Meet space details cannot be retrieved. Google Meet API v2 is not available through googleapis library.',
         error: 'API_NOT_AVAILABLE'
      })
   })
)

module.exports = router
