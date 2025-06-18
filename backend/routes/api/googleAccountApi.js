const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { google } = require('googleapis')

const User = require('../../models/UserModel')
const Page = require('../../models/PageModel')
const Task = require('../../models/TaskModel')
const dotenv = require('dotenv')

dotenv.config()

const newOath2Client = () =>
   new google.auth.OAuth2(
      process.env?.GOOGLE_CLIENT_ID,
      process.env?.GOOGLE_CLIENT_SECRET,
      process.env?.APP_PATH
   )
const listEvent = async (refreshToken, minDate, maxDate) => {
   try {
      const oath2Client = newOath2Client()
      oath2Client.setCredentials({ refresh_token: refreshToken })
      const googleCalendarApi = google.calendar('v3')
      const calendars = await googleCalendarApi.calendarList.list({
         auth: oath2Client,
         maxResults: 50,
         showDeleted: false
      })
      const events = await Promise.all(
         calendars.data.items.map(async (calendar) => {
            const event = await googleCalendarApi.events.list({
               auth: oath2Client,
               calendarId: calendar.id,
               timeMin: minDate,
               timeMax: maxDate,
               singleEvents: true,
               orderBy: 'startTime',
               showDeleted: false,
               showHiddenInvitations: true
            })
            return {
               ...event.data,
               ...calendar
            }
         })
      )
      return events
   } catch (err) {
      return []
   }
}
// @route   GET api/google-account/list-events
// @desc    Get Google Events
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
      user.google_accounts = user.google_accounts.map((acc) =>
         notSyncedAccounts.includes(acc._id)
            ? { ...acc, sync_status: false }
            : { ...acc, sync_status: true }
      )
      user.update_date = new Date()
      user.save()
      res.json(gAccounts)
   } catch (err) {
      console.error('---ERROR---: ' + err.message)
      // TODO: Handle Google authentication error
      res.json(err.code)
      // res.status(err.code).json({
      //    errors: [{ code: err.code, title: 'alert-oops', msg: err.message }]
      // })
   }
})

// @route   POST api/google-account/add-account
// @desc    Create Google Account Auth Tokens
// @access  Private
router.post('/add-account', auth, async (req, res) => {
   try {
      const oath2Client = newOath2Client()
      const { code, range } = req.body
      const { tokens } = await oath2Client.getToken(code)
      const { refresh_token, id_token } = tokens
      //get email
      const ticket = await oath2Client.verifyIdToken({
         idToken: id_token,
         audience: process.env?.GOOGLE_CLIENT_ID
      })
      const payload = ticket.getPayload()
      const account_email = payload['email']
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
         const newUSer = await User.findOneAndUpdate(
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
         existingGoogleAccount = newUSer.google_accounts.find(
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
      const oath2Client = newOath2Client()
      const { target_task, slot_index, page_id, account_id } = req.body
      const user = await User.findById(req.user.id)
      const refreshToken = user.google_accounts.find(
         (acc) => acc._id.toString() === account_id
      ).refresh_token
      oath2Client.setCredentials({ refresh_token: refreshToken })
      const calendar = google.calendar('v3')
      const event = await calendar.events.insert({
         auth: oath2Client,
         calendarId: 'primary', // TODO: Allow to add more calendars
         requestBody: {
            summary: target_task.title,
            colorId: '3', // Purple
            start: {
               dateTime: new Date(target_task.schedule[slot_index].start)
            },
            end: {
               dateTime: new Date(target_task.schedule[slot_index].end)
            }
         }
      })
      const task = await Task.findById(target_task._id)

      task.update_date = new Date()
      await task.save()

      // Data: get new page
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
      console.error('---ERROR---: ' + err.message)
      // TODO: Handle Google authentication error
      res.status(err.code).json({
         errors: [{ code: err.code, title: 'alert-oops', msg: err.message }]
      })
   }
})

// @route   POST api/google-account/delete-event/:eventId
// @desc    Delete Google Event
// @access  Private
router.post('/delete-event/:eventId', auth, async (req, res) => {
   try {
      const oath2Client = newOath2Client()
      const user = await User.findById(req.user.id)
      oath2Client.setCredentials({ refresh_token: user.google_refresh_token })
      const calendar = google.calendar('v3')
      await calendar.events.delete({
         auth: oath2Client,
         calendarId: 'primary', // TODO: Allow to add more calendars
         eventId: req.params.eventId
      })
      const { pageId } = req.body

      // Data: get new page
      const newPage = await Page.findOneAndUpdate(
         { _id: pageId },
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
         page: newPage,
         event: { id: req.params.eventId, deleted: true }
      })
   } catch (err) {
      console.error('---ERROR---: ' + err.message)
      // TODO: Handle Google authentication error
      res.status(err.code).json({
         errors: [{ code: err.code, title: 'alert-oops', msg: err.message }]
      })
   }
})

module.exports = router
