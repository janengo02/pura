const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')
const { google } = require('googleapis')

const User = require('../../models/User')
const Page = require('../../models/Page')
const Task = require('../../models/Task')
const Progress = require('../../models/Progress')
const Group = require('../../models/Group')

const GOOGLE_CLIENT_ID =
   '468371290571-ul1g9cfmv5gvk8plu5lh32tomo20s767.apps.googleusercontent.com'
const GOOGLE_CLIENT_SECRET = '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'
const APP_PATH = 'http://localhost:2000'

const oath2Client = new google.auth.OAuth2(
   GOOGLE_CLIENT_ID,
   GOOGLE_CLIENT_SECRET,
   APP_PATH
)

const getNewMap = (page, task_id, group_id = null, progress_id = null) => {
   const taskIndex = page.tasks.findIndex((t) => t.equals(task_id))
   var taskMapIndex = 0
   if (page.task_map[0] <= taskIndex) {
      for (let i = 1; i < page.task_map.length; i++) {
         if (
            page.task_map[i - 1] <= taskIndex &&
            page.task_map[i] > taskIndex
         ) {
            taskMapIndex = i
            break
         }
      }
   }
   const progressIndex = taskMapIndex % page.progress_order.length
   const groupIndex = parseInt(
      (taskMapIndex - progressIndex) / page.group_order.length
   )
   var newProgressIndex = progressIndex
   var newGroupIndex = groupIndex
   var newTaskMapIndex = taskMapIndex
   const newTaskArray = Array.from(page.tasks)
   const newTaskMap = Array.from(page.task_map)

   if (group_id) {
      newGroupIndex = page.group_order.indexOf(group_id)
      newTaskMapIndex =
         newGroupIndex * page.progress_order.length + progressIndex
   }
   if (progress_id) {
      newProgressIndex = page.progress_order.indexOf(progress_id)
      newTaskMapIndex =
         groupIndex * page.progress_order.length + newProgressIndex
   }
   if (group_id || progress_id) {
      const targetTask = page.tasks[taskIndex]

      var newTaskIndex = page.task_map[newTaskMapIndex]
      if (newTaskMapIndex > taskMapIndex) {
         newTaskIndex--
      }
      newTaskArray.splice(taskIndex, 1)
      newTaskArray.splice(newTaskIndex, 0, targetTask)
      // Moving between different columns
      if (newTaskMapIndex < taskMapIndex) {
         for (let i = newTaskMapIndex; i < taskMapIndex; i++) {
            newTaskMap[i]++
         }
      } else {
         for (let i = taskMapIndex; i < newTaskMapIndex; i++) {
            newTaskMap[i]--
         }
      }
   }

   return { newTaskArray, newTaskMap, newGroupIndex, newProgressIndex }
}

// @route   GET POST api/task/:page-id/:task-id
// @desc    Get task info
// @access  Private
router.get('/:page_id/:task_id', auth, async (req, res) => {
   try {
      //   Validation: Check if page exists
      const page = await Page.findById(req.params.page_id)
      if (!page) {
         return res.status(404).json({ msg: 'Page not found' })
      }
      //   Validation: Check if user is the owner
      if (page.user.toString() !== req.user.id) {
         return res.status(401).json({ msg: 'User not authorized' })
      }
      const user = await User.findById(req.user.id)

      //   Validation: Check if task exists
      const task = await Task.findById(req.params.task_id)

      // Get group and progress data
      const { newGroupIndex, newProgressIndex } = getNewMap(
         page,
         req.params.task_id
      )
      const group = await Group.findById(page.group_order[newGroupIndex])
      const progress = await Progress.findById(
         page.progress_order[newProgressIndex]
      )
      const {
         _id,
         title,
         schedule,
         google_events,
         content,
         create_date,
         update_date
      } = task
      const syncedSchedule = await Promise.all(
         schedule.map(async (s, si) => {
            if (typeof google_events[si] === 'string') {
               oath2Client.setCredentials({
                  refresh_token: user.google_refresh_token
               })
               const googleCalendarApi = google.calendar('v3')
               const event = await googleCalendarApi.events
                  .get({
                     auth: oath2Client,
                     calendarId: 'primary',
                     eventId: google_events[si]
                  })
                  .then(() => {
                     return true
                  })
                  .catch(() => {
                     return false
                  })
               return {
                  start: s.start,
                  end: s.end,
                  _id: s._id,
                  gEventId: event ? google_events[si] : null
               }
            }
            return {
               start: s.start,
               end: s.end,
               _id: s._id,
               gEventId: null
            }
         })
      )
      const response = {
         _id,
         title,
         schedule: syncedSchedule,
         google_events,
         content,
         create_date,
         update_date,
         group,
         progress
      }
      res.json(response)
   } catch (err) {
      console.error('---ERROR---: ' + err.message)

      if (err.kind === 'ObjectId') {
         return res.status(404).json({
            errors: [
               { code: '404', title: 'alert-oops', msg: 'alert-task-notfound' }
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
// @route   POST api/task/new/:page-id
// @desc    Create a new task
// @access  Private
router.post(
   '/new/:page_id',
   [
      auth,
      check('group_id', 'Group is required').not().isEmpty(),
      check('progress_id', 'Progress is required').not().isEmpty()
   ],
   async (req, res) => {
      //   Validation: Check if page exists
      const page = await Page.findById(req.params.page_id)
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
      //   Validation: Form input
      const result = validationResult(req)
      if (!result.isEmpty()) {
         return res.status(400).json({ errors: result.array() })
      }
      //   Prepare: Set up new task
      const { group_id, progress_id, title, schedule, content } = req.body
      const newTask = {}
      if (title) newTask.title = title
      if (schedule) newTask.schedule = schedule
      if (content) newTask.content = content

      //   Prepare: Set up new task_map
      const groupId = page.group_order.indexOf(group_id)
      const progressId = page.progress_order.indexOf(progress_id)
      //   Validation: Check if group and progress exist
      if (groupId === -1 || progressId === -1) {
         return res.status(404).json({
            errors: [
               { title: 'alert-oops', msg: 'alert-group_progress-notfound' }
            ]
         })
      }
      const taskMapIndex = groupId * page.progress_order.length + progressId
      var newTaskMap = page.task_map
      for (let i = taskMapIndex; i < newTaskMap.length; i++) {
         newTaskMap[i]++
      }

      try {
         // Data: Add new task
         const task = new Task(newTask)
         await task.save()
         // Data: Add new progress to page
         const newPage = await Page.findOneAndUpdate(
            { _id: req.params.page_id },
            {
               $push: {
                  tasks: {
                     $each: [task],
                     $position: newTaskMap[taskMapIndex] - 1
                  }
               },
               $set: { update_date: new Date() }
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
            .populate('tasks', ['title', 'google_events'])

         // Data: Update page's task_map
         newPage.task_map = newTaskMap
         await newPage.save()

         res.json({ task_id: task._id })
      } catch (error) {
         console.error('---ERROR---: ' + error.message)
         res.status(500).json({
            errors: [
               { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
            ]
         })
      }
   }
)

// @route   POST api/task/update/:page-id/:task-id
// @desc    Update a task
// @access  Private
router.post('/update/:page_id/:task_id', [auth], async (req, res) => {
   //   Validation: Check if page exists
   const page = await Page.findById(req.params.page_id)
   if (!page) {
      return res.status(404).json({ msg: 'Page not found' })
   }
   //   Validation: Check if user is the owner
   if (page.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' })
   }
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Validation: Check if task exists
   const task = await Task.findById(req.params.task_id)
   if (!task) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-task-notfound' }
         ]
      })
   }

   //   Prepare: Set up new task
   const {
      title,
      schedule,
      google_events,
      content,
      group_id,
      progress_id,
      synced_g_event,
      task_detail_flg
   } = req.body
   task.update_date = new Date()
   if (title) task.title = title
   if (schedule) task.schedule = schedule
   if (google_events) task.google_events = google_events
   if (content) task.content = content
   try {
      if (!group_id && !progress_id) {
         await task.save()
      }
      if (task_detail_flg) {
         const { newTaskArray, newTaskMap, newGroupIndex, newProgressIndex } =
            getNewMap(page, req.params.task_id, group_id, progress_id)

         const newPageValues =
            progress_id || group_id
               ? { tasks: newTaskArray, update_date: new Date() }
               : { update_date: new Date() }
         const newPage = await Page.findOneAndUpdate(
            { _id: req.params.page_id },
            { $set: newPageValues },
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
         // Data: Update page's task_map
         if (progress_id || group_id) {
            newPage.task_map = newTaskMap
            await newPage.save()
         }

         const group = await Group.findById(page.group_order[newGroupIndex])
         const progress = await Progress.findById(
            page.progress_order[newProgressIndex]
         )
         const {
            _id,
            title,
            schedule,
            google_events,
            content,
            create_date,
            update_date
         } = task
         const newTask = {
            _id,
            title,
            schedule,
            google_events,
            content,
            create_date,
            update_date,
            group,
            progress
         }

         if (typeof synced_g_event === 'string') {
            const gEventIndex = google_events.findIndex(
               (g) => g === synced_g_event
            )
            const user = await User.findById(req.user.id)
            oath2Client.setCredentials({
               refresh_token: user.google_refresh_token
            })
            const calendar = google.calendar('v3')
            if (gEventIndex !== -1) {
               const gEventStart = schedule[gEventIndex].start
               const gEventEnd = schedule[gEventIndex].end
               const event = await calendar.events.patch({
                  auth: oath2Client,
                  calendarId: 'primary', // TODO: Allow to add more calendars
                  eventId: synced_g_event,
                  requestBody: {
                     start: {
                        dateTime: new Date(gEventStart)
                     },
                     end: {
                        dateTime: new Date(gEventEnd)
                     }
                  }
               })
               res.json({ page: newPage, task: newTask, event: event.data })
            } else {
               const event = await calendar.events.delete({
                  auth: oath2Client,
                  calendarId: 'primary',
                  eventId: synced_g_event
               })
               res.json({
                  page: newPage,
                  task: newTask,
                  event: { id: synced_g_event, deleted: true }
               })
            }
         } else {
            res.json({ page: newPage, task: newTask })
         }
      } else {
         const newPage = await Page.findOneAndUpdate(
            { _id: req.params.page_id },
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

         res.json({ page: newPage, task: {} })
      }
   } catch (error) {
      console.error('---ERROR---: ' + error.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   DELETE api/task/:page-id/:task-id
// @desc    Delete a task
// @access  Private
router.delete('/:page_id/:task_id', [auth], async (req, res) => {
   //   Validation: Check if page exists
   const page = await Page.findById(req.params.page_id)
   if (!page) {
      return res.status(404).json({ msg: 'Page not found' })
   }
   //   Validation: Check if user is the owner
   if (page.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' })
   }

   //   Validation: Check if task exists
   const task = await Task.findById(req.params.task_id)
   if (!task) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-task-notfound' }
         ]
      })
   }
   //   Prepare: Set up new tasks array
   const { task_id } = req.params
   var newTasks = page.tasks
   const taskIndex = newTasks.indexOf(task_id)
   newTasks.splice(taskIndex, 1)

   //   Prepare: Set up new task_map
   var newTaskMap = page.task_map
   for (let i = 0; i < newTaskMap.length; i++) {
      if (newTaskMap[i] > taskIndex) newTaskMap[i]--
   }

   try {
      await Task.deleteOne({ _id: task_id })
      // Data: Update page's arrays
      page.tasks = newTasks
      page.task_map = newTaskMap
      await page.save()
      // Data: get new page
      const newPage = await Page.findOneAndUpdate(
         { _id: req.params.page_id },
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

      res.json(newPage)
      // TODO: Delete related google events
   } catch (error) {
      console.error('---ERROR---: ' + error.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})
module.exports = router
