const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { google } = require('googleapis')

const User = require('../../models/UserModel')
const Page = require('../../models/PageModel')
const Task = require('../../models/TaskModel')
const dotenv = require('dotenv')

dotenv.config()

const oath2Client = new google.auth.OAuth2(
   process.env?.GOOGLE_CLIENT_ID,
   process.env?.GOOGLE_CLIENT_SECRET,
   process.env?.APP_PATH
)

const listEvent = async (refreshToken, minDate, maxDate) => {
   try {
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
      // TODO: Handle Google authentication error
      console.log('hihihi', err)
      return []
   }
}
// @route   GET api/google-account/list-events
// @desc    Get Google Events
// @access  Private
router.get('/list-events', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id).populate(
         'google_accounts',
         ['refresh_token']
      )
      const { minDate, maxDate } = req.query
      const newGoogleAccounts = []
      const gAccounts = await Promise.all(
         user.google_accounts.map(async (account) => {
            const accountCalendars = await listEvent(
               account.refresh_token,
               minDate,
               maxDate
            )
            if (accountCalendars.length > 0) {
               newGoogleAccounts.push(account)
            }
            return {
               _id: account._id,
               calendars: accountCalendars
            }
         })
      )
      await User.findOneAndUpdate(
         { _id: req.user.id },
         {
            $set: {
               google_accounts: newGoogleAccounts,
               update_date: new Date()
            }
         },
         { new: true }
      )
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

// @route   POST api/google-account/create-tokens
// @desc    Create Google Account Auth Tokens
// @access  Private
router.post('/create-tokens', auth, async (req, res) => {
   try {
      const { code, range } = req.body
      const { tokens } = await oath2Client.getToken(code)
      const { refresh_token } = tokens
      const user = await User.findOneAndUpdate(
         { _id: req.user.id },
         {
            $push: { google_accounts: { refresh_token: refresh_token } },
            $set: { update_date: new Date() }
         },
         { new: true }
      )
      const gAccounts = await Promise.all(
         user.google_accounts.map(async (account) => {
            const accountCalendars = await listEvent(
               account.refresh_token,
               range[0],
               range[1]
            )
            return {
               _id: account._id,
               calendars: accountCalendars
            }
         })
      )
      res.json(gAccounts)
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
      const { target_task, slot_index, page_id } = req.body
      const user = await User.findById(req.user.id)
      oath2Client.setCredentials({ refresh_token: user.google_refresh_token })
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
      if (!task) {
         return res.status(404).json({
            errors: [
               { code: '404', title: 'alert-oops', msg: 'alert-task-notfound' }
            ]
         })
      }
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

      res.json({ event: event.data, page: newPage, task: target_task })
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
