const express = require('express')
const dotenv = require('dotenv')
const router = express.Router()

const auth = require('../../middleware/auth')
const User = require('../../models/UserModel')
const Page = require('../../models/PageModel')
const Task = require('../../models/TaskModel')

const { sendErrorResponse } = require('../../utils/responseHelper')
const {
   setOAuthCredentials,
   listEvent,
   updateGoogleAccountSyncStatus
} = require('../../utils/googleAccountHelper')

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
         user.google_accounts = user.google_accounts.map((acc) =>
            acc.account_email === account_email
               ? { ...acc, refresh_token: refresh_token, sync_status: true }
               : acc
         )
         user.update_date = new Date()
         user.save()
      } else {
         const newUser = await User.findOneAndUpdate(
            { _id: req.user.id },
            {
               $push: {
                  google_accounts: {
                     refresh_token: refresh_token,
                     account_email: account_email,
                     sync_status: true
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

      const newAccountCalendars = await listEvent(
         refresh_token,
         range[0],
         range[1]
      )
      res.json({
         _id: existingGoogleAccount._id,
         account_email: existingGoogleAccount.account_email,
         sync_status: true,
         calendars: newAccountCalendars
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   POST api/google-account/create-event
// @desc    Create a new event in the user's Google Calendar.
// @params  target_task (body) - Task details for the event.
//          slot_index (body) - Index of the time slot in the task schedule.
//          page_id (body) - ID of the page associated with the task.
//          account_id (body) - ID of the Google account to use.
// @access  Private
router.post('/create-event', auth, async (req, res) => {
   try {
      const { target_task, slot_index, page_id, account_id } = req.body
      const user = await User.findById(req.user.id)
      const refreshToken = user.google_accounts.find(
         (acc) => acc._id.toString() === account_id
      ).refresh_token
      const oath2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar('v3')
      const event = await calendar.events.insert({
         auth: oath2Client,
         calendarId: 'primary',
         requestBody: {
            summary: target_task.title,
            colorId: '3',
            start: {
               dateTime: new Date(target_task.schedule[slot_index].start)
            },
            end: { dateTime: new Date(target_task.schedule[slot_index].end) }
         }
      })
      const task = await Task.findById(target_task._id)
      task.update_date = new Date()
      await task.save()

      const newPage = await Page.findOneAndUpdate(
         { _id: page_id },
         { $set: { update_date: new Date() } },
         { new: true }
      )
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])

      res.json({
         event: event.data,
         task: { ...target_task, schedule: task.schedule }
      })
   } catch (err) {
      sendErrorResponse(
         res,
         err.code || 500,
         'alert-oops',
         'alert-server_error',
         err
      )
   }
})

// @route   POST api/google-account/delete-event/:eventId
// @desc    Delete an event from the user's Google Calendar.
// @params  eventId (params) - ID of the event to delete.
//          accountId (body) - ID of the Google account to use.
//          calendarId (body) - ID of the calendar containing the event.
// @access  Private
router.post('/delete-event/:eventId', auth, async (req, res) => {
   try {
      const { accountId, calendarId } = req.body
      const user = await User.findById(req.user.id)
      const refreshToken = user.google_accounts.find(
         (acc) => acc._id.toString() === accountId
      ).refresh_token
      const oath2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar('v3')
      await calendar.events.delete({
         auth: oath2Client,
         calendarId,
         eventId: req.params.eventId
      })

      res.json({ event: { id: req.params.eventId, deleted: true } })
   } catch (err) {
      sendErrorResponse(
         res,
         err.code || 500,
         'alert-oops',
         'alert-server_error',
         err
      )
   }
})

module.exports = router
