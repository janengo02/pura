const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { google } = require('googleapis')

const User = require('../../models/User')
const Page = require('../../models/Page')
const Task = require('../../models/Task')

const GOOGLE_CLIENT_ID =
   '468371290571-ul1g9cfmv5gvk8plu5lh32tomo20s767.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
const APP_PATH = 'http://localhost:2000'

const oath2Client = new google.auth.OAuth2(
   GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET,
   APP_PATH
)
// @route   GET api/google-account/list-events
// @desc    Get Google Events
// @access  Private
router.get('/list-events', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id)
      oath2Client.setCredentials({ refresh_token: user.google_refresh_token })
      const calendar = google.calendar('v3')
      const { minDate, maxDate } = req.query
      const events = await calendar.events.list({
         auth: oath2Client,
         calendarId: 'primary', // TODO: Allow to add more calendars
         timeMin: minDate,
         timeMax: maxDate,
         singleEvents: true,
         orderBy: 'startTime',
         showDeleted: false,
         showHiddenInvitations: true
      })
      res.json(events.data)
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
      oath2Client.setCredentials({ refresh_token: user.google_refresh_token })
      const calendar = google.calendar('v3')
      const events = await calendar.events.list({
         auth: oath2Client,
         calendarId: 'primary', // TODO: Allow to add more calendars
         timeMin: new Date(),
         timeMax: new Date('2024-8-25'),
         singleEvents: true,
         orderBy: 'startTime',
         showDeleted: false,
         showHiddenInvitations: true
      })
      res.json(events.data)
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
      const response = await calendar.events.insert({
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
      const gEventId = response.data.id
      const task = await Task.findById(target_task._id)
      if (!task) {
         return res.status(404).json({
            errors: [
               { code: '404', title: 'alert-oops', msg: 'alert-task-notfound' }
            ]
         })
      }
      task.google_events[slot_index] = gEventId
      target_task.google_events[slot_index] = gEventId
      await task.save()
      const events = await calendar.events.list({
         auth: oath2Client,
         calendarId: 'primary' // TODO: Allow to add more calendars
      })
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
         .populate('tasks', ['title', 'google_events'])

      res.json({ events: events.data, page: newPage, task: target_task })
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
      const { taskId, gEventIndex, pageId } = req.body
      if (taskId) {
         const task = await Task.findById(taskId)
         if (!task) {
            return res.status(404).json({
               errors: [
                  {
                     code: '404',
                     title: 'alert-oops',
                     msg: 'alert-task-notfound'
                  }
               ]
            })
         }
         task.google_events[gEventIndex] = null
         await task.save()
      }

      const events = await calendar.events.list({
         auth: oath2Client,
         calendarId: 'primary' // TODO: Allow to add more calendars
      })
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
         .populate('tasks', ['title', 'google_events'])

      res.json({ events: events.data, page: newPage })
   } catch (err) {
      console.error('---ERROR---: ' + err.message)
      // TODO: Handle Google authentication error
      res.status(err.code).json({
         errors: [{ code: err.code, title: 'alert-oops', msg: err.message }]
      })
   }
})

module.exports = router
