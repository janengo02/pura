const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { validationResult } = require('express-validator')
const { google } = require('googleapis')

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
// @route   GET api/page
// @desc    Get the first page of the user (temporary)
// @access  Private
router.get('/', auth, async (req, res) => {
   try {
      const page = await Page.findOne({ user: req.user.id })
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])
      res.json(page)
   } catch (err) {
      console.error('---ERROR---: ' + err.message)

      if (err.kind === 'ObjectId') {
         return res.status(404).json({
            errors: [
               { code: '404', title: 'alert-oops', msg: 'alert-page-notfound' }
            ]
         })
      }
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   GET api/page/check-sync-status
// @desc    Get the first page of the user and check schedule slots' sync status
// @desc    Only check the accounts that are synced
// @access  Private
router.get('/check-sync-status', auth, async (req, res) => {
   try {
      const user = await User.findById(req.user.id)
      const syncedAccounts = user.google_accounts.filter(
         (account) => account.sync_status
      )
      const page = await Page.findOne({ user: req.user.id })
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])
      const newTaskArray = [...page.tasks]

      newTaskArray.forEach((task) => {
         if (task.schedule.length > 0) {
            task.schedule.forEach((slot, slotIndex) => {
               if (slot.sync_info.length > 0) {
                  slot.sync_info.forEach(async (si, siIndex) => {
                     const refreshToken = syncedAccounts.find(
                        (acc) => acc._id.toString() === si.account_id
                     )?.refresh_token
                     if (refreshToken) {
                        const oath2Client = newOath2Client()
                        oath2Client.setCredentials({
                           refresh_token: refreshToken
                        })
                        const googleCalendarApi = google.calendar('v3')
                        const googleRes = await googleCalendarApi.events
                           .get({
                              auth: oath2Client,
                              calendarId: 'primary',
                              eventId: si.event_id
                           })
                           .then((response) => {
                              return response
                           })
                           .catch(() => {
                              return {}
                           })
                        if (Object.keys(googleRes).length === 0) {
                           const newTask = await Task.findById(
                              task._id.toString()
                           )
                           newTask.schedule[slotIndex].sync_info =
                              newTask.schedule[slotIndex].sync_info.filter(
                                 (nsi) => nsi.event_id !== si.event_id
                              )
                           newTask.update_date = new Date()
                           await newTask.save()
                        } else {
                           const googleEvent = googleRes.data
                           const slotStart = Date.parse(slot.start)
                           const slotEnd = Date.parse(slot.end)
                           const gEventStart = Date.parse(
                              googleEvent.start.dateTime
                           )
                           const gEventEnd = Date.parse(
                              googleEvent.end.dateTime
                           )
                           if (
                              slotStart !== gEventStart ||
                              slotEnd !== gEventEnd
                           ) {
                              const newTask = await Task.findById(
                                 task._id.toString()
                              )
                              newTask.schedule[slotIndex].sync_info[
                                 siIndex
                              ].is_matched = false
                              newTask.update_date = new Date()
                              await newTask.save()
                           }
                        }
                     }
                  })
               }
            })
         }
      })
      res.json(newTaskArray)
   } catch (err) {
      console.error('---ERROR---: ' + err.message)

      if (err.kind === 'ObjectId') {
         return res.status(404).json({
            errors: [
               { code: '404', title: 'alert-oops', msg: 'alert-page-notfound' }
            ]
         })
      }
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   GET api/page/:id
// @desc    Get page by page id
// @access  Private
router.get('/:id', auth, async (req, res) => {
   try {
      const page = await Page.findById(req.params.id)
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])
      if (!page) {
         return res.status(404).json({
            errors: [
               { code: '404', title: 'alert-oops', msg: 'alert-page-notfound' }
            ]
         })
      }
      // Check if the user is the owner of the page
      if (page.user.toString() !== req.user.id) {
         return res.status(401).json({
            errors: [
               {
                  code: '401',
                  title: 'alert-oops',
                  msg: 'alert-user-unauthorize'
               }
            ]
         })
      }
      res.json(page)
   } catch (err) {
      console.error('---ERROR---: ' + err.message)

      if (err.kind === 'ObjectId') {
         return res.status(404).json({
            errors: [
               { code: '404', title: 'alert-oops', msg: 'alert-page-notfound' }
            ]
         })
      }
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   POST api/page
// @desc    Create a page
// @access  Private
router.post('/', [auth], async (req, res) => {
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Prepare: Set up new page
   const newPage = {
      user: req.user.id,
      progress_order: [],
      group_order: [],
      task_map: [],
      tasks: []
   }
   if (req.body.title) {
      newPage.title = req.body.title
   }
   try {
      // Data: Add new page
      page = new Page(newPage)
      await page.save()

      res.json(page)
   } catch (error) {
      console.error('---ERROR---: ' + error.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   POST api/page/move-task/:id
// @desc    Update page when move the position of a task
// @access  Private
router.post('/move-task/:id', [auth], async (req, res) => {
   //   Validation: Check if page exists
   const page = await Page.findById(req.params.id)
   if (!page) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-page-notfound' }
         ]
      })
   }

   //   Validation: Check if user is the owner
   if (page.user.toString() !== req.user.id) {
      return res.status(401).json({
         errors: [
            {
               code: '401',
               title: 'alert-oops',
               msg: 'alert-user-unauthorize'
            }
         ]
      })
   }
   const { destination, source, draggableId } = req.body.result
   const startSpace = +source.droppableId
   const endSpace = +destination.droppableId

   const oldTaskId = +draggableId
   const targetTask = page.tasks[oldTaskId]
   var newTaskId = destination.index
   if (endSpace !== 0) {
      newTaskId += page.task_map[endSpace - 1]
   }
   if (endSpace > startSpace) {
      newTaskId--
   }

   const newTaskArray = Array.from(page.tasks)
   const newTaskMap = Array.from(page.task_map)

   newTaskArray.splice(oldTaskId, 1)
   newTaskArray.splice(newTaskId, 0, targetTask)
   // Moving between different columns
   if (endSpace < startSpace) {
      for (let i = endSpace; i < startSpace; i++) {
         newTaskMap[i]++
      }
   } else {
      for (let i = startSpace; i < endSpace; i++) {
         newTaskMap[i]--
      }
   }

   try {
      // Data: Add new group to page
      const newPage = await Page.findOneAndUpdate(
         { _id: req.params.id },
         {
            $set: { tasks: newTaskArray, update_date: new Date() }
         },
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

      // Data: Update page's task_map
      newPage.task_map = newTaskMap
      await newPage.save()
      res.json()
   } catch (err) {
      console.error('---ERROR---: ' + err.message)

      if (err.kind === 'ObjectId') {
         return res.status(404).json({
            errors: [
               {
                  code: '404',
                  title: 'alert-oops',
                  msg: 'alert-page-notfound'
               }
            ]
         })
      }
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})
module.exports = router
