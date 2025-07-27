const express = require('express')
const dotenv = require('dotenv')
const router = express.Router()
const { google } = require('googleapis')

const auth = require('../../middleware/auth')
const User = require('../../models/UserModel')
const Task = require('../../models/TaskModel')

const { sendErrorResponse } = require('../../utils/responseHelper')
const {
   setOAuthCredentials,
   listEvent,
   updateGoogleAccountSyncStatus,
   autoSetDefaultForSingleAccount,
   ensureSingleDefaultAccount
} = require('../../utils/googleAccountHelper')
const { updateTaskFromGoogleEvent } = require('../../utils/taskHelpers')

dotenv.config()

// @route   GET api/google-account/list-events
// @desc    Retrieve Google Calendar events for all linked accounts within a specified date range.
// @params  minDate (query) - Minimum date for filtering events.
//          maxDate (query) - Maximum date for filtering events.
// @access  Private
router.get('/list-events', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id)
      const { minDate, maxDate } = req.query
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
      res.json(gAccounts)
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   POST api/google-account/add-account
// @desc    Add a new Google account and retrieve its authentication tokens.
// @params  code (body) - Authorization code from Google OAuth.
//          range (body) - Date range for initial calendar sync.
// @access  Private
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
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   PUT api/google-account/set-default/:account_id
// @desc    Set a Google account as the default account
// @params  account_email (params) - Email of the account to set as default
// @access  Private
router.put('/set-default/:account_email', auth, async (req, res) => {
   try {
      const { account_email } = req.params
      const user = await User.findById(req.user.id)

      // Verify account exists and belongs to user
      const targetAccount = user.google_accounts.find(
         (acc) => acc.account_email === account_email
      )

      if (!targetAccount) {
         return sendErrorResponse(res, 404, 'alert-oops', 'Account not found')
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
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   GET api/google-account/default
// @desc    Get the current default Google account
// @access  Private
router.get('/default', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id)
      const defaultAccount = user.google_accounts.find((acc) => acc.is_default)

      if (!defaultAccount) {
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'No default account set'
         )
      }

      res.json({
         _id: defaultAccount._id,
         account_email: defaultAccount.account_email,
         sync_status: defaultAccount.sync_status,
         is_default: defaultAccount.is_default
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   POST api/google-account/update-event/:eventId
// @desc    Update an event in the user's Google Calendar & synced Pura task if it exists.
// @params  eventId (params) - ID of the event to update.
//          accountEmail (body) - Email of the Google account to use.
//          calendarId (body) - ID of the calendar containing the event.
//          eventData (body) - Updated event data
// @access  Private
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
         colorId
      } = req.body

      const user = await User.findById(req.user.id)
      const refreshToken = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      ).refresh_token

      const oath2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar('v3')

      const originalEvent = await calendar.events.get({
         auth: oath2Client,
         calendarId: originalCalendarId || 'primary',
         eventId: eventId
      })
      const eventData = originalEvent.data
      const updatedEventData = {
         ...eventData, // Preserve other existing properties
         start: {
            dateTime: start
         },
         end: {
            dateTime: end
         },
         colorId: colorId,
         summary: summary || eventData.summary,
         description: description || eventData.description,
         location: location || eventData.location
      }

      let event

      // Check if calendar is changing
      if (
         originalCalendarId &&
         calendarId &&
         originalCalendarId !== calendarId
      ) {
         // Create a copy in the new calendar
         event = await calendar.events.insert({
            auth: oath2Client,
            calendarId: calendarId,
            requestBody: updatedEventData
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
         eventId // Pass original event ID in case we need to update task references
      )

      res.json({ event: event.data })
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   DELETE api/google-account/delete-event/:eventId
// @desc    Delete an event from the user's Google Calendar (only used for google events, not synced Pura tasks).
// @params  eventId (params) - ID of the event to delete.
//          accountEmail (body) - Email of the Google account to use.
//          calendarId (body) - ID of the calendar containing the event.
// @access  Private
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

      // First get the event to check if it's a Pura task
      try {
         await calendar.events.get({
            auth: oath2Client,
            calendarId: calendarId || 'primary',
            eventId: eventId
         })
      } catch (err) {
         // Event might already be deleted
         console.log('Event not found, might already be deleted')
      }

      // Delete the event
      await calendar.events.delete({
         auth: oath2Client,
         calendarId: calendarId || 'primary',
         eventId: eventId
      })

      res.json({ event: { id: eventId, deleted: true } })
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   DELETE api/google-account/disconnect/:account_email
// @desc    Disconnect a Google account
// @params  account_email (params) - Email of the account to disconnect
// @access  Private
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
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

module.exports = router
