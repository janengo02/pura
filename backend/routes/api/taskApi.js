const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const dotenv = require('dotenv')

const auth = require('../../middleware/auth')
const { sendErrorResponse } = require('../../utils/responseHelper')
const { validatePage } = require('../../utils/pageHelpers')
const {
   getNewMap,
   deleteGoogleEventsForRemovedSlots,
   syncTaskSlotWithGoogle
} = require('../../utils/taskHelpers')

const User = require('../../models/UserModel')
const Page = require('../../models/PageModel')
const Task = require('../../models/TaskModel')
const Progress = require('../../models/ProgressModel')
const Group = require('../../models/GroupModel')
const { SCHEDULE_SYNCE_STATUS } = require('@pura/shared')
const { google } = require('googleapis')
const { setOAuthCredentials } = require('../../utils/googleAccountHelper')

dotenv.config()

// @route   GET POST api/task/:page-id/:task-id
// @desc    Get task info
// @access  Private
router.get('/:page_id/:task_id', auth, async (req, res) => {
   try {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'Page not found or unauthorized'
         )
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

      // --- Google sync status logic ---
      const scheduleWithSync = await Promise.all(
         (task.schedule || []).map(async (slot) => {
            // NONE = no sync event (no google_event_id)
            if (!slot.google_event_id) {
               return {
                  ...slot.toObject(),
                  sync_status: SCHEDULE_SYNCE_STATUS.NONE
               }
            }

            // ACCOUNT_NOT_CONNECTED = not synced (google account cannot be connected)
            const account = user.google_accounts?.find(
               (acc) => acc._id.toString() === slot.google_account_id
            )
            if (!account) {
               return {
                  ...slot.toObject(),
                  sync_status: SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED
               }
            }

            let oauth2Client, calendar, event
            try {
               oauth2Client = setOAuthCredentials(account.refresh_token)
               calendar = google.calendar({ version: 'v3', auth: oauth2Client })
            } catch (err) {
               return {
                  ...slot.toObject(),
                  sync_status: SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED
               }
            }

            try {
               event = await calendar.events.get({
                  calendarId: slot.google_calendar_id || 'primary',
                  eventId: slot.google_event_id
               })
            } catch (err) {
               // EVENT_NOT_FOUND = not synced (account ok, event not found)
               return {
                  ...slot.toObject(),
                  sync_status: SCHEDULE_SYNCE_STATUS.EVENT_NOT_FOUND
               }
            }
            if (event.data.status === 'cancelled') {
               // EVENT_CANCELLED = not synced (event cancelled)
               return {
                  ...slot.toObject(),
                  sync_status: SCHEDULE_SYNCE_STATUS.EVENT_CANCELLED
               }
            }
            // Compare slot schedule with event schedule
            const slotStart = new Date(slot.start).toISOString()
            const slotEnd = new Date(slot.end).toISOString()
            const eventStartRaw =
               event.data.start?.dateTime || event.data.start?.date
            const eventEndRaw = event.data.end?.dateTime || event.data.end?.date

            // Normalize event times to ISO string for comparison
            const eventStart = new Date(eventStartRaw).toISOString()
            const eventEnd = new Date(eventEndRaw).toISOString()

            if (slotStart === eventStart && slotEnd === eventEnd) {
               // SYNCED = synced normally
               return {
                  ...slot.toObject(),
                  sync_status: SCHEDULE_SYNCE_STATUS.SYNCED,
                  google_event: event.data
               }
            } else {
               // NOT_SYNCED = not synced (event found, but schedule mismatch)
               return {
                  ...slot.toObject(),
                  sync_status: SCHEDULE_SYNCE_STATUS.NOT_SYNCED,
                  google_event: event.data
               }
            }
         })
      )

      const { _id, title, content, create_date, update_date } = task

      const response = {
         _id,
         title,
         schedule: scheduleWithSync,
         content,
         create_date,
         update_date,
         group,
         progress
      }
      res.json(response)
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
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
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'alert-page-notfound or unauthorized'
         )
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
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'alert-group_progress-notfound'
         )
      }
      const taskMapIndex = groupId * page.progress_order.length + progressId
      let newTaskMap = page.task_map.slice()
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
            .populate('tasks', ['title', 'schedule'])

         // Data: Update page's task_map
         newPage.task_map = newTaskMap
         await newPage.save()

         res.json({ task: task })
      } catch (error) {
         sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
      }
   }
)

// @route   POST api/task/update/:page-id/:task-id
// @desc    Update a task
// @access  Private
router.post('/update/:page_id/:task_id', [auth], async (req, res) => {
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.page_id, req.user.id)
   if (!page) {
      return sendErrorResponse(
         res,
         404,
         'alert-oops',
         'Page not found or unauthorized'
      )
   }
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Validation: Check if task exists
   const task = await Task.findById(req.params.task_id)
   if (!task) {
      return sendErrorResponse(res, 404, 'alert-oops', 'alert-task-notfound')
   }
   // Store old schedule for comparison
   const oldSchedule = task.schedule ? [...task.schedule] : []

   //   Prepare: Set up new task
   const { title, schedule, content, group_id, progress_id, task_detail_flg } =
      req.body
   task.update_date = new Date()

   const titleChanged = title && title !== task.title
   if (title) task.title = title
   if (schedule) task.schedule = schedule
   if (content) task.content = content

   // Handle schedule updates
   if (schedule) {
      // Delete Google events for removed slots
      if (oldSchedule.length > 0) {
         await deleteGoogleEventsForRemovedSlots(
            oldSchedule,
            schedule,
            req.user.id
         )
      }

      // Update existing Google events for modified slots
      for (let i = 0; i < schedule.length; i++) {
         const newSlot = schedule[i]
         if (newSlot.google_event_id) {
            const oldSlot = oldSchedule.find(
               (slot) => slot.google_event_id === newSlot.google_event_id
            )

            // Check if this slot has a Google event and if times have changed
            if (
               oldSlot &&
               (newSlot.start !== oldSlot.start ||
                  newSlot.end !== oldSlot.end ||
                  titleChanged)
            ) {
               // Update the Google Calendar event
               const result = await syncTaskSlotWithGoogle(
                  task._id,
                  title,
                  newSlot,
                  newSlot.google_account_id,
                  newSlot.google_calendar_id,
                  req.user.id
               )

               if (!result.success) {
                  return sendErrorResponse(
                     res,
                     400,
                     'alert-oops',
                     result.message || 'alert-server_error'
                  )
               }
            }
         }
      }
   }
   const currentSchedule = schedule
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
            .populate('tasks', ['title', 'schedule'])
         // Data: Update page's task_map
         if (progress_id || group_id) {
            newPage.task_map = newTaskMap
            await newPage.save()
         }

         const group = await Group.findById(page.group_order[newGroupIndex])
         const progress = await Progress.findById(
            page.progress_order[newProgressIndex]
         )
         const { _id, title, content, create_date, update_date } = task
         const newTask = {
            _id,
            title,
            schedule: currentSchedule,
            content,
            create_date,
            update_date,
            group,
            progress
         }
         res.json({ page: newPage, task: newTask })
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
            .populate('tasks', ['title', 'schedule'])

         res.json({ page: newPage, task: {} })
      }
   } catch (error) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})

// @route   POST api/task/sync-google-event
// @desc    Create a new event in the user's Google Calendar with explicit calendar selection
// @params  task_id (body) - Task ID for the event.
//          slot_index (body) - Index of the time slot in the task schedule.
//          account_id (body) - ID of the Google account to use.
//          calendar_id (body) - ID of the specific calendar to use.
// @access  Private
router.post('/sync-google-event', auth, async (req, res) => {
   try {
      const { task_id, slot_index, account_id, calendar_id, sync_action } =
         req.body
      //   Validation: Check if task exists
      const task = await Task.findById(task_id)
      if (!task) {
         return sendErrorResponse(res, 404, 'alert-oops', 'alert-task-notfound')
      }
      const slot = task.schedule[slot_index]

      const result = await syncTaskSlotWithGoogle(
         task_id,
         task.title,
         slot,
         account_id,
         calendar_id,
         req.user.id,
         sync_action
      )

      if (!result.success) {
         return sendErrorResponse(
            res,
            400,
            'alert-oops',
            result.message || 'alert-server_error'
         )
      }
      // Update task slot with Google event info
      task.schedule[slot_index].google_event_id = result.event.id
      task.schedule[slot_index].google_account_id = account_id
      task.schedule[slot_index].google_calendar_id = calendar_id
      task.update_date = new Date()
      await task.save()

      // Get page to determine group and progress
      const page = await Page.findOne({ tasks: task_id })
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])

      if (!page) {
         return sendErrorResponse(res, 404, 'alert-oops', 'Page not found')
      }

      // Get group and progress data using the same logic as update API
      const { newGroupIndex, newProgressIndex } = getNewMap(page, task_id)
      const group = await Group.findById(page.group_order[newGroupIndex])
      const progress = await Progress.findById(
         page.progress_order[newProgressIndex]
      )

      // Format task response to match update API structure
      const { _id, title, content, create_date, update_date } = task
      const newTask = {
         _id,
         title,
         schedule: task.schedule,
         content,
         create_date,
         update_date,
         group,
         progress
      }

      res.json({
         page: page,
         task: newTask,
         event: result.event
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

// @route   DELETE api/task/:page-id/:task-id
// @desc    Delete a task
// @access  Private
router.delete('/:page_id/:task_id', [auth], async (req, res) => {
   const { task_id } = req.params
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.page_id, req.user.id)
   if (!page) {
      return sendErrorResponse(
         res,
         404,
         'alert-oops',
         'Page not found or unauthorized'
      )
   }

   //   Validation: Check if task exists
   const task = await Task.findById(task_id)
   if (!task) {
      return sendErrorResponse(res, 404, 'alert-oops', 'alert-task-notfound')
   }

   // Delete associated Google Calendar events
   if (task.schedule && task.schedule.length > 0) {
      await deleteGoogleEventsForRemovedSlots(task.schedule, [], req.user.id)
   }

   //   Prepare: Set up new tasks array
   let newTasks = page.tasks.slice()
   const taskIndex = page.tasks.findIndex((t) => t.equals(task_id))
   newTasks.splice(taskIndex, 1)
   //   Prepare: Set up new task_map
   let newTaskMap = page.task_map.slice()
   for (let i = 0; i < newTaskMap.length; i++) {
      if (newTaskMap[i] > taskIndex) newTaskMap[i]--
   }

   try {
      await Task.deleteOne({ _id: task_id })
      // Data: Update page's arrays
      page.tasks = newTasks
      page.task_map = newTaskMap
      page.update_date = new Date()
      await page.save()
      res.json()
   } catch (error) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})
module.exports = router
