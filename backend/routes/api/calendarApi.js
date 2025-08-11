const express = require('express')
const dotenv = require('dotenv')
const router = express.Router()
const { google } = require('googleapis')

const auth = require('../../middleware/auth')
const User = require('../../models/UserModel')

const { sendErrorResponse } = require('../../utils/responseHelper')
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
router.get('/list-events', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id)
      const { minDate, maxDate, pageId } = req.query
      const notSyncedAccounts = []

      const gAccounts = await Promise.all(
         user.google_accounts.map(async (account) => {
            const accountCalendars = await listEvent(
               account.refresh_token,
               minDate,
               maxDate
            )
            if (accountCalendars.length === 0) {
               notSyncedAccounts.push(account._id)
            }
            return {
               _id: account._id,
               account_email: account.account_email,
               sync_status: accountCalendars.length > 0,
               is_default: account.is_default,
               calendars: accountCalendars
            }
         })
      )
      updateGoogleAccountSyncStatus(user, notSyncedAccounts)
      const page = await validatePage(pageId, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }
      await page.populate('tasks', ['title', 'schedule', 'content'])
      res.json({ google_accounts: gAccounts, tasks: page.tasks })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route POST api/calendar/add-account
 * @desc Add/update Google account via OAuth
 * @access Private
 * @param {string} code oAuth code from Google
 * @param {Array} range [startDate, endDate] for fetching events
 * @returns {Object} Account details with calendars
 */
router.post('/add-account', auth, async (req, res) => {
   try {
      const { code, range } = req.body
      const oath2Client = setOAuthCredentials()
      const { tokens } = await oath2Client.getToken(code)
      const { refresh_token, id_token } = tokens

      const ticket = await oath2Client.verifyIdToken({
         idToken: id_token,
         audience: process.env?.GOOGLE_CLIENT_ID
      })

      const account_email = ticket.getPayload()['email']
      const user = await User.findById(req.user.id)

      let existingGoogleAccount = user.google_accounts.find(
         (acc) => acc.account_email === account_email
      )

      if (existingGoogleAccount) {
         // Update existing account
         user.google_accounts = user.google_accounts.map((acc) =>
            acc.account_email === account_email
               ? { ...acc, refresh_token: refresh_token, sync_status: true }
               : acc
         )
         user.update_date = new Date()
         await user.save()
      } else {
         // Add new account
         const isFirstAccount = user.google_accounts.length === 0
         const newUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
               $push: {
                  google_accounts: {
                     refresh_token: refresh_token,
                     account_email: account_email,
                     sync_status: true,
                     is_default: isFirstAccount // First account is automatically default
                  }
               },
               $set: { update_date: new Date() }
            },
            { new: true }
         )

         existingGoogleAccount = newUser.google_accounts.find(
            (acc) => acc.account_email === account_email
         )
      }

      // Auto-set default if only one account
      await autoSetDefaultForSingleAccount(user)

      const newAccountCalendars = await listEvent(
         refresh_token,
         range[0],
         range[1]
      )

      res.json({
         _id: existingGoogleAccount._id,
         account_email: existingGoogleAccount.account_email,
         sync_status: true,
         is_default: existingGoogleAccount.is_default,
         calendars: newAccountCalendars
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route PUT api/calendar/set-default/:account_email
 * @desc Set Google account as default
 * @access Private
 * @param {string} account_email
 * @returns {Object} Updated account details
 */
router.put('/set-default/:account_email', auth, async (req, res) => {
   try {
      const { account_email } = req.params
      const user = await User.findById(req.user.id)

      // Verify account exists and belongs to user
      const targetAccount = user.google_accounts.find(
         (acc) => acc.account_email === account_email
      )

      if (!targetAccount) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

      // Set new default account
      await ensureSingleDefaultAccount(user, account_email)

      // Return updated account data
      const updatedUser = await User.findById(req.user.id)
      const updatedAccount = updatedUser.google_accounts.find(
         (acc) => acc.account_email === account_email
      )

      res.json({
         _id: updatedAccount._id,
         account_email: updatedAccount.account_email,
         sync_status: updatedAccount.sync_status,
         is_default: updatedAccount.is_default,
         message: 'Default account updated successfully'
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route GET api/calendar/default
 * @desc Get current default Google account
 * @access Private
 * @returns {Object} Default account details
 */
router.get('/default', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id)
      const defaultAccount = user.google_accounts.find((acc) => acc.is_default)

      if (!defaultAccount) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

      res.json({
         _id: defaultAccount._id,
         account_email: defaultAccount.account_email,
         sync_status: defaultAccount.sync_status,
         is_default: defaultAccount.is_default
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

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
router.post('/create-event', auth, async (req, res) => {
   try {
      const {
         accountEmail,
         calendarId,
         summary,
         start,
         end,
         description,
         colorId
      } = req.body

      const user = await User.findById(req.user.id)
      const refreshToken = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      )?.refresh_token

      if (!refreshToken) {
         return sendErrorResponse(res, 404, 'google', 'access')
      }

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
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

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
router.post('/update-event/:eventId', auth, async (req, res) => {
   try {
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

      const user = await User.findById(req.user.id)
      const refreshToken = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      )?.refresh_token

      const oath2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar('v3')

      const originalEvent = await calendar.events.get({
         auth: oath2Client,
         calendarId: originalCalendarId || 'primary',
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
      if (
         originalCalendarId &&
         calendarId &&
         originalCalendarId !== calendarId
      ) {
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
            calendarId: originalCalendarId || 'primary',
            eventId: eventId,
            conferenceDataVersion: 1, // Required for conference data support
            requestBody: updatedEventData
         })
      }

      // Update Pura task if it exists
      // Use the new event ID if the event was moved to a different calendar
      const finalEventId =
         originalCalendarId && calendarId && originalCalendarId !== calendarId
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
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route DELETE api/calendar/delete-event/:eventId
 * @desc Delete Google Calendar event (non-Pura task events only)
 * @access Private
 * @param {string} eventId
 * @param {string} accountEmail
 * @param {string} calendarId
 * @returns {Object} {event: {id, deleted: true}}
 */
router.delete('/delete-event/:eventId', auth, async (req, res) => {
   try {
      const { eventId } = req.params
      const { accountEmail, calendarId } = req.body

      const user = await User.findById(req.user.id)
      const refreshToken = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      ).refresh_token

      const oath2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar('v3')

      await calendar.events.delete({
         auth: oath2Client,
         calendarId: calendarId || 'primary',
         eventId: eventId
      })

      res.json({ event: { id: eventId, deleted: true } })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route DELETE api/calendar/disconnect/:account_email
 * @desc Disconnect Google account
 * @access Private
 * @param {string} account_email
 * @returns {Object} {message}
 */
router.delete('/disconnect/:account_email', auth, async (req, res) => {
   try {
      const { account_email } = req.params
      const user = await User.findById(req.user.id)

      // Remove the Google account
      user.google_accounts = user.google_accounts.filter(
         (acc) => acc.account_email !== account_email
      )

      await user.save()
      res.json({ message: 'Account disconnected' })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

module.exports = router
