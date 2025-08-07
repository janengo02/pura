const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const dotenv = require('dotenv')

const auth = require('../../middleware/auth')
const { sendErrorResponse } = require('../../utils/responseHelper')
const { validatePage } = require('../../utils/pageHelpers')
const {
   deleteGoogleEventsForRemovedSlots,
   syncTaskSlotWithGoogleHelper,
   formatTaskResponse,
   updateTaskBasicInfo,
   moveTask,
   updateTaskSchedule,
   addTaskScheduleSlot,
   removeTaskScheduleSlot
} = require('../../utils/taskHelpers')

const Page = require('../../models/PageModel')
const Task = require('../../models/TaskModel')

dotenv.config()

/**
 * @route GET api/task/:page_id/:task_id
 * @desc Get task info
 * @access Private
 * @param {string} page_id, task_id
 * @returns {Object} Task with title, content, schedule
 */
router.get('/:page_id/:task_id', auth, async (req, res) => {
   try {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }

      //   Validation: Check if task exists
      const task = await Task.findById(req.params.task_id)
      if (!task) {
         return sendErrorResponse(res, 404, 'task', 'access')
      }

      // Use the enhanced formatTaskResponse with sync status calculation
      const response = await formatTaskResponse(task, page, req.user.id)
      res.json(response.task)
   } catch (err) {
      sendErrorResponse(res, 500, 'task', 'access', err)
   }
})
/**
 * @route POST api/task/new/:page_id
 * @desc Create new task
 * @access Private
 * @param {string} page_id
 * @body {string} group_id, progress_id, [title], [schedule], [content]
 * @returns {Object} {task} created task object
 */
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
         return sendErrorResponse(res, 404, 'page', 'access')
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
      if (groupId === -1) {
         return sendErrorResponse(res, 404, 'group', 'access')
      }
      if (progressId === -1) {
         return sendErrorResponse(res, 404, 'progress', 'access')
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

         // Data: Update page's task_map
         newPage.task_map = newTaskMap
         await newPage.save()

         res.json({ task: task })
      } catch (error) {
         sendErrorResponse(res, 500, 'task', 'create', error)
      }
   }
)

/**
 * @route POST api/task/sync-google-event
 * @desc Sync task slot with Google Calendar
 * @access Private
 * @body {string} task_id, slot_index, account_email, calendar_id, sync_action
 * @returns {Object} {task, event} updated task and calendar event
 */
router.post('/sync-google-event', auth, async (req, res) => {
   try {
      const { task_id, slot_index, account_email, calendar_id, sync_action } =
         req.body

      const result = await syncTaskSlotWithGoogleHelper(
         task_id,
         slot_index,
         account_email,
         calendar_id,
         req.user.id,
         sync_action
      )

      if (!result.success) {
         throw new Error(result.message)
      }

      // Use the enhanced formatTaskResponse with sync status calculation
      const response = await formatTaskResponse(
         result.task,
         result.page,
         req.user.id
      )
      res.json({
         ...response,
         event: result.event
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'google', 'sync', err)
   }
})

/**
 * @route PUT api/task/basic/:page_id/:task_id
 * @desc Update task title and content
 * @access Private
 * @param {string} page_id, task_id
 * @body {string} [title], [content]
 * @returns {Object} Updated task object
 */
router.put('/basic/:page_id/:task_id', auth, async (req, res) => {
   try {
      // Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }

      const { title, content } = req.body
      const result = await updateTaskBasicInfo(
         req.params.task_id,
         req.params.page_id,
         req.user.id,
         {
            title,
            content
         }
      )

      if (!result.success) {
         throw new Error(result.message)
      }

      const response = await formatTaskResponse(
         result.task,
         result.page,
         req.user.id
      )
      res.json(response)
   } catch (err) {
      sendErrorResponse(res, 500, 'task', 'update', err)
   }
})

/**
 * @route PUT api/task/move/:page_id/:task_id
 * @desc Move task to different group/progress
 * @access Private
 * @param {string} page_id, task_id
 * @body {string} [group_id], [progress_id]
 * @returns {Object} Updated task object
 */
router.put('/move/:page_id/:task_id', auth, async (req, res) => {
   try {
      // Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }

      const { group_id, progress_id } = req.body
      if (!group_id && !progress_id) {
         return sendErrorResponse(res, 400, 'validation', 'failed')
      }

      const result = await moveTask(req.params.task_id, req.params.page_id, {
         group_id,
         progress_id
      })

      if (!result.success) {
         throw new Error(result.message)
      }

      const response = await formatTaskResponse(
         result.task,
         result.page,
         req.user.id
      )
      res.json(response)
   } catch (err) {
      sendErrorResponse(res, 500, 'task', 'move', err)
   }
})

/**
 * @route PUT api/task/schedule/:page_id/:task_id/:slot_index
 * @desc Update task schedule slot time
 * @access Private
 * @param {string} page_id, task_id, slot_index
 * @body {string} [start], [end]
 * @returns {Object} Updated task object
 */
router.put(
   '/schedule/:page_id/:task_id/:slot_index',
   auth,
   async (req, res) => {
      try {
         // Validation: Check if page exists and user is the owner
         const page = await validatePage(req.params.page_id, req.user.id)
         if (!page) {
            return sendErrorResponse(res, 404, 'page', 'access')
         }

         const slotIndex = parseInt(req.params.slot_index)
         if (isNaN(slotIndex)) {
            return sendErrorResponse(res, 400, 'validation', 'failed')
         }

         const { start, end } = req.body
         if (!start && !end) {
            return sendErrorResponse(res, 400, 'validation', 'failed')
         }

         const result = await updateTaskSchedule(
            req.params.task_id,
            req.params.page_id,
            req.user.id,
            { slotIndex, start, end }
         )

         if (!result.success) {
            throw new Error(result.message)
         }

         const response = await formatTaskResponse(
            result.task,
            result.page,
            req.user.id
         )
         res.json(response)
      } catch (err) {
         sendErrorResponse(res, 500, 'schedule', 'update', err)
      }
   }
)

/**
 * @route POST api/task/schedule/:page_id/:task_id
 * @desc Add new schedule slot to task
 * @access Private
 * @param {string} page_id, task_id
 * @body {string} start, end
 * @returns {Object} {task, newSlotIndex}
 */
router.post('/schedule/:page_id/:task_id', auth, async (req, res) => {
   try {
      // Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }

      const { start, end } = req.body
      if (!start || !end) {
         return sendErrorResponse(res, 400, 'validation', 'failed')
      }

      const result = await addTaskScheduleSlot(
         req.params.task_id,
         req.params.page_id,
         {
            start,
            end
         }
      )

      if (!result.success) {
         throw new Error(result.message)
      }

      const response = await formatTaskResponse(
         result.task,
         result.page,
         req.user.id
      )
      res.json({ ...response, newSlotIndex: result.newSlotIndex })
   } catch (err) {
      sendErrorResponse(res, 500, 'schedule', 'create', err)
   }
})

/**
 * @route DELETE api/task/schedule/:page_id/:task_id/:slot_index
 * @desc Remove schedule slot from task
 * @access Private
 * @param {string} page_id, task_id, slot_index
 * @returns {Object} Updated task object
 */
router.delete(
   '/schedule/:page_id/:task_id/:slot_index',
   auth,
   async (req, res) => {
      try {
         // Validation: Check if page exists and user is the owner
         const page = await validatePage(req.params.page_id, req.user.id)
         if (!page) {
            return sendErrorResponse(res, 404, 'page', 'access')
         }

         const slotIndex = parseInt(req.params.slot_index)
         if (isNaN(slotIndex)) {
            return sendErrorResponse(res, 400, 'validation', 'failed')
         }

         const result = await removeTaskScheduleSlot(
            req.params.task_id,
            req.params.page_id,
            req.user.id,
            { slotIndex }
         )

         if (!result.success) {
            throw new Error(result.message)
         }

         const response = await formatTaskResponse(
            result.task,
            result.page,
            req.user.id
         )
         res.json(response)
      } catch (err) {
         sendErrorResponse(res, 500, 'schedule', 'delete', err)
      }
   }
)

/**
 * @route DELETE api/task/:page_id/:task_id
 * @desc Delete task and associated Google Calendar events
 * @access Private
 * @param {string} page_id, task_id
 * @returns {Object} Empty response on success
 */
router.delete('/:page_id/:task_id', [auth], async (req, res) => {
   const { task_id } = req.params
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.page_id, req.user.id)
   if (!page) {
      return sendErrorResponse(res, 404, 'page', 'access')
   }

   //   Validation: Check if task exists
   const task = await Task.findById(task_id)
   if (!task) {
      return sendErrorResponse(res, 404, 'task', 'access')
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
      sendErrorResponse(res, 500, 'task', 'delete', error)
   }
})
module.exports = router
