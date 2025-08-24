const express = require('express')
const dotenv = require('dotenv')
const router = express.Router()
const { google } = require('googleapis')

const auth = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')
const {
   validateListEvents,
   validateAddGoogleAccount,
   validateUpdateDefaultCalendar,
   validateCreateEvent,
   validateUpdateEvent,
   validateDeleteEvent,
   validateDisconnectAccount
} = require('../../validators/calendarValidators')
const prisma = require('../../config/prisma')

const { asyncHandler } = require('../../utils/asyncHandler')
const { NotFoundError } = require('../../utils/customErrors')
const { encrypt, decrypt, isEncrypted } = require('../../utils/encryption')
const {
   setOAuthCredentials,
   listEvent,
   updateGoogleAccountSyncStatus,
   autoSetDefaultForSingleAccount,
   ensureSingleDefaultAccount
} = require('../../utils/calendarHelpers')
const { updateTaskFromGoogleEvent } = require('../../utils/taskHelpers')
const { validatePage } = require('../../utils/pageHelpers')

dotenv.config()

/**
 * @route GET api/calendar/list-events
 * @desc Get Google Calendar events for all linked accounts
 * @access Private
 * @param {string} minDate
 * @param {string} maxDate
 * @returns {Array} Google accounts with calendar events
 */
router.get(
   '/list-events',
   auth,
   validate(validateListEvents),
   asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })

      if (!user) {
         throw new NotFoundError('User not found', 'user', 'not_found')
      }

      const { minDate, maxDate, pageId } = req.query
      const notSyncedAccounts = []

      const gAccounts = await Promise.all(
         user.googleAccounts.map(async (account) => {
            // Decrypt refresh token before use
            const decryptedToken = isEncrypted(account.refreshToken)
               ? decrypt(account.refreshToken)
               : account.refreshToken

            const accountCalendars = await listEvent(
               decryptedToken,
               minDate,
               maxDate
            )
            if (accountCalendars.length === 0) {
               notSyncedAccounts.push(account.id)
            }
            return {
               id: account.id,
               accountEmail: account.accountEmail,
               syncStatus: accountCalendars.length > 0,
               isDefault: account.isDefault,
               calendars: accountCalendars
            }
         })
      )
      await updateGoogleAccountSyncStatus(user, notSyncedAccounts)
      const page = await validatePage(pageId, req.user.id)
      if (!page) {
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )
      }
      // Get page with tasks using Prisma
      const pageWithTasks = await prisma.page.findUnique({
         where: { id: page.id }
      })

      // Get tasks separately since we removed the relation
      const tasksData = await prisma.task.findMany({
         where: { id: { in: pageWithTasks.tasks } }
      })

      // Sort tasks to match the order in pageWithTasks.tasks
      const taskMap = tasksData.reduce((map, task) => {
         map[task.id] = task
         return map
      }, {})
      const tasks = pageWithTasks.tasks
         .map((taskId) => taskMap[taskId])
         .filter(Boolean)

      res.json({ googleAccounts: gAccounts, tasks: tasks })
   })
)

/**
 * @route POST api/calendar/add-account
 * @desc Add/update Google account via OAuth
 * @access Private
 * @param {string} code oAuth code from Google
 * @param {Array} range [startDate, endDate] for fetching events
 * @returns {Object} Account details with calendars
 */
router.post(
   '/add-account',
   auth,
   validate(validateAddGoogleAccount),
   asyncHandler(async (req, res) => {
      const { code, range } = req.body
      const oath2Client = setOAuthCredentials()
      const { tokens } = await oath2Client.getToken(code)
      const { refresh_token, id_token } = tokens

      const ticket = await oath2Client.verifyIdToken({
         idToken: id_token,
         audience: process.env?.GOOGLE_CLIENT_ID
      })

      const account_email = ticket.getPayload()['email']
      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })

      let existingGoogleAccount = user.googleAccounts.find(
         (acc) => acc.accountEmail === account_email
      )

      if (existingGoogleAccount) {
         // Update existing account with encrypted token
         existingGoogleAccount = await prisma.googleAccount.update({
            where: { id: existingGoogleAccount.id },
            data: {
               refreshToken: encrypt(refresh_token),
               syncStatus: true
            }
         })

         await prisma.user.update({
            where: { id: req.user.id },
            data: { updateDate: new Date() }
         })
      } else {
         // Add new account with encrypted token
         const isFirstAccount = user.googleAccounts.length === 0
         existingGoogleAccount = await prisma.googleAccount.create({
            data: {
               refreshToken: encrypt(refresh_token),
               accountEmail: account_email,
               syncStatus: true,
               isDefault: isFirstAccount,
               userId: req.user.id
            }
         })

         await prisma.user.update({
            where: { id: req.user.id },
            data: { updateDate: new Date() }
         })
      }

      // Auto-set default if only one account
      await autoSetDefaultForSingleAccount(user)

      const newAccountCalendars = await listEvent(
         refresh_token, // Use the plain token for the immediate sync
         range[0],
         range[1]
      )

      res.json({
         id: existingGoogleAccount.id,
         accountEmail: existingGoogleAccount.accountEmail,
         syncStatus: true,
         isDefault: existingGoogleAccount.isDefault,
         calendars: newAccountCalendars
      })
   })
)

/**
 * @route PUT api/calendar/set-default/:accountEmail
 * @desc Set Google account as default
 * @access Private
 * @param {string} accountEmail
 * @returns {Object} Updated account details
 */
router.put(
   '/set-default/:accountEmail',
   auth,
   validate(validateUpdateDefaultCalendar),
   asyncHandler(async (req, res) => {
      const { accountEmail } = req.params
      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })

      // Verify account exists and belongs to user
      const targetAccount = user.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      )

      if (!targetAccount) {
         throw new NotFoundError('Google account not found', 'google', 'access')
      }

      // Set new default account
      await ensureSingleDefaultAccount(user, accountEmail)

      // Return updated account data
      const updatedUser = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })
      const updatedAccount = updatedUser.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      )

      res.json({
         id: updatedAccount.id,
         accountEmail: updatedAccount.accountEmail,
         syncStatus: updatedAccount.syncStatus,
         isDefault: updatedAccount.isDefault,
         message: 'Default account updated successfully'
      })
   })
)

/**
 * @route GET api/calendar/default
 * @desc Get current default Google account
 * @access Private
 * @returns {Object} Default account details
 */
router.get(
   '/default',
   auth,
   asyncHandler(async (req, res) => {
      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })
      const defaultAccount = user.googleAccounts.find((acc) => acc.isDefault)

      if (!defaultAccount) {
         throw new NotFoundError(
            'No default Google account found',
            'google',
            'access'
         )
      }

      res.json({
         id: defaultAccount.id,
         accountEmail: defaultAccount.accountEmail,
         syncStatus: defaultAccount.syncStatus,
         isDefault: defaultAccount.isDefault
      })
   })
)

/**
 * @route POST api/calendar/create-event
 * @desc Create a new Google Calendar event
 * @access Private
 * @param {string} accountEmail
 * @param {string} calendarId
 * @param {string} summary
 * @param {string} start
 * @param {string} end
 * @param {string} description @optional
 * @param {string} location @optional
 * @param {string} colorId @optional
 * @returns {Object} {event: created event, calendar: calendar of the created event}
 */
router.post(
   '/create-event',
   auth,
   validate(validateCreateEvent),
   asyncHandler(async (req, res) => {
      const {
         accountEmail,
         calendarId,
         summary,
         start,
         end,
         description,
         colorId
      } = req.body

      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })
      const encryptedRefreshToken = user.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      )?.refreshToken

      if (!encryptedRefreshToken) {
         throw new NotFoundError('Google account not found', 'google', 'access')
      }

      // Decrypt the refresh token before use
      const refreshToken = isEncrypted(encryptedRefreshToken)
         ? decrypt(encryptedRefreshToken)
         : encryptedRefreshToken

      const oath2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar('v3')

      const eventData = {
         summary: summary,
         description: description || '',
         colorId: colorId,
         start: {
            dateTime: start
         },
         end: {
            dateTime: end
         }
      }

      const event = await calendar.events.insert({
         auth: oath2Client,
         calendarId: calendarId || 'primary',
         requestBody: eventData
      })

      const eventCalendar = await calendar.calendarList.get({
         auth: oath2Client,
         calendarId: calendarId || 'primary'
      })

      res.json({ event: event.data, calendar: eventCalendar.data })
   })
)

/**
 * @route POST api/calendar/update-event/:eventId
 * @desc Update Google Calendar event and sync to Pura task
 * @access Private
 * @param {string} eventId
 * @param {string} accountEmail
 * @param {string} originalCalendarId
 * @param {string} calendarId
 * @param {string} start
 * @param {string} end
 * @param {string} summary @optional
 * @param {string} location @optional
 * @param {string} description @optional
 * @param {string} colorId @optional
 * @param {Object} conferenceData @optional
 * @returns {Object} {event: updated event, calendar: calendar of the updated event}
 */
router.post(
   '/update-event/:eventId',
   auth,
   validate(validateUpdateEvent),
   asyncHandler(async (req, res) => {
      const { eventId } = req.params
      const {
         accountEmail,
         originalCalendarId,
         calendarId,
         start,
         end,
         summary,
         location,
         description,
         colorId,
         conferenceData
      } = req.body

      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })
      const encryptedRefreshToken = user.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      )?.refreshToken

      // Decrypt the refresh token before use
      const refreshToken = isEncrypted(encryptedRefreshToken)
         ? decrypt(encryptedRefreshToken)
         : encryptedRefreshToken

      const oath2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar('v3')

      const originalEvent = await calendar.events.get({
         auth: oath2Client,
         calendarId: originalCalendarId,
         eventId: eventId
      })
      const eventData = originalEvent.data

      // Handle conferenceData updates properly
      let updatedConferenceData = eventData.conferenceData
      if (conferenceData !== undefined) {
         if (conferenceData === null) {
            // Explicitly remove conference data
            updatedConferenceData = null
         } else if (conferenceData.createRequest) {
            // Creating new conference (Google Meet) - raw API format
            updatedConferenceData = {
               createRequest: {
                  requestId:
                     conferenceData.createRequest.requestId ||
                     `req_${Date.now()}`,
                  conferenceSolutionKey: {
                     type:
                        conferenceData.createRequest.conferenceSolutionKey
                           ?.type || 'hangoutsMeet'
                  }
               }
            }
         } else if (
            conferenceData.type === 'google_meet' &&
            conferenceData.id
         ) {
            // Frontend format - convert to Google Calendar API format
            updatedConferenceData = {
               conferenceId: conferenceData.id,
               conferenceSolution: {
                  key: {
                     type: 'hangoutsMeet'
                  },
                  name: 'Google Meet',
                  iconUri:
                     'https://fonts.gstatic.com/s/i/productlogos/meet_2020q4/v6/web-512dp/logo_meet_2020q4_color_2x_web_512dp.png'
               },
               entryPoints: [
                  {
                     entryPointType: 'video',
                     uri: conferenceData.joinUrl,
                     label: conferenceData.joinUrl
                  },
                  ...(conferenceData.phoneNumbers || []).map((phone) => ({
                     entryPointType: 'phone',
                     uri: `tel:${phone.number}`,
                     label: phone.number,
                     pin: phone.pin,
                     regionCode: phone.regionCode
                  }))
               ]
            }
         } else {
            // Raw Google Calendar API format or other format
            updatedConferenceData = conferenceData
         }
      }

      const updatedEventData = {
         ...eventData, // Preserve other existing properties
         start: {
            dateTime: start
         },
         end: {
            dateTime: end
         },
         colorId: colorId || eventData.colorId,
         summary: summary || eventData.summary,
         description: description || eventData.description,
         location: location || eventData.location,
         conferenceData: updatedConferenceData
      }

      let event

      // Check if calendar is changing
      if (calendarId && originalCalendarId !== calendarId) {
         // Create a copy in the new calendar - remove properties that cause conflicts
         const {
            id,
            etag,
            htmlLink,
            iCalUID,
            created,
            updated,
            creator,
            organizer,
            ...eventDataForInsert
         } = updatedEventData
         event = await calendar.events.insert({
            auth: oath2Client,
            calendarId: calendarId,
            conferenceDataVersion: 1, // Required for conference data support
            requestBody: eventDataForInsert
         })

         // Delete the original event
         await calendar.events.delete({
            auth: oath2Client,
            calendarId: originalCalendarId,
            eventId: eventId
         })
      } else {
         // Update event in the same calendar
         event = await calendar.events.update({
            auth: oath2Client,
            calendarId: originalCalendarId,
            eventId: eventId,
            conferenceDataVersion: 1, // Required for conference data support
            requestBody: updatedEventData
         })
      }

      // Update Pura task if it exists
      // Use the new event ID if the event was moved to a different calendar
      const finalEventId =
         calendarId && originalCalendarId !== calendarId
            ? event.data.id
            : eventId

      await updateTaskFromGoogleEvent(
         finalEventId,
         updatedEventData,
         eventId, // Pass original event ID in case we need to update task references
         calendarId // Pass new calendar ID for calendar moves
      )

      const updatedCalendar = await calendar.calendarList.get({
         auth: oath2Client,
         calendarId: calendarId
      })

      res.json({ event: event.data, calendar: updatedCalendar.data })
   })
)

/**
 * @route DELETE api/calendar/delete-event/:eventId
 * @desc Delete Google Calendar event (non-Pura task events only)
 * @access Private
 * @param {string} eventId
 * @param {string} accountEmail
 * @param {string} calendarId
 * @returns {Object} {event: {id, deleted: true}}
 */
router.delete(
   '/delete-event/:eventId',
   auth,
   validate(validateDeleteEvent),
   asyncHandler(async (req, res) => {
      const { eventId } = req.params
      const { accountEmail, calendarId } = req.body

      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })
      const encryptedRefreshToken = user.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      ).refreshToken

      // Decrypt the refresh token before use
      const refreshToken = isEncrypted(encryptedRefreshToken)
         ? decrypt(encryptedRefreshToken)
         : encryptedRefreshToken

      const oath2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar('v3')

      await calendar.events.delete({
         auth: oath2Client,
         calendarId: calendarId || 'primary',
         eventId: eventId
      })

      res.json({ event: { id: eventId, deleted: true } })
   })
)

/**
 * @route DELETE api/calendar/disconnect/:accountEmail
 * @desc Disconnect Google account
 * @access Private
 * @param {string} accountEmail
 * @returns {Object} {message}
 */
router.delete(
   '/disconnect/:accountEmail',
   auth,
   validate(validateDisconnectAccount),
   asyncHandler(async (req, res) => {
      const { accountEmail } = req.params
      const user = await prisma.user.findUnique({
         where: { id: req.user.id },
         include: { googleAccounts: true }
      })

      // Remove the Google account
      const accountToDelete = user.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      )

      if (accountToDelete) {
         await prisma.googleAccount.delete({
            where: { id: accountToDelete.id }
         })
      }
      res.json({ message: 'Account disconnected' })
   })
)

module.exports = router
