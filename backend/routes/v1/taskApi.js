const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')

const auth = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')
const {
   validateTaskParams,
   validateSlotParams,
   validateCreateTask,
   validateUpdateTaskBasic,
   validateMoveTask,
   validateUpdateTaskSchedule,
   validateAddTaskScheduleSlot,
   validateSyncGoogleEvent
} = require('../../validators/taskValidators')
const { sendErrorResponse } = require('../../utils/responseHelper')
const { validatePage } = require('../../utils/pageHelpers')
const {
   extractId,
   deleteGoogleEventsForRemovedSlots,
   syncTaskSlotWithGoogleHelper,
   formatTaskResponse,
   updateTaskBasicInfo,
   moveTask,
   updateTaskSchedule,
   addTaskScheduleSlot,
   removeTaskScheduleSlot
} = require('../../utils/taskHelpers')

const prisma = require('../../config/prisma')

dotenv.config()

/**
 * @route GET api/task/:pageId/:taskId
 * @desc Get task info
 * @access Private
 * @param {string} pageId, taskId
 * @returns {Object} Task with title, content, schedule
 */
router.get(
   '/:pageId/:taskId',
   auth,
   validate(validateTaskParams),
   async (req, res) => {
      try {
         //   Validation: Check if page exists and user is the owner
         const page = await validatePage(req.params.pageId, req.user.id)
         if (!page) {
            return sendErrorResponse(res, 404, 'page', 'access')
         }

         //   Validation: Check if task exists
         const task = await prisma.task.findUnique({
            where: { id: req.params.taskId }
         })
         if (!task) {
            return sendErrorResponse(res, 404, 'task', 'access')
         }

         // Use the enhanced formatTaskResponse with sync status calculation
         const response = await formatTaskResponse(task, page, req.user.id)
         res.json(response.task)
      } catch (err) {
         sendErrorResponse(res, 500, 'task', 'access', err)
      }
   }
)
/**
 * @route POST api/task/new/:pageId
 * @desc Create new task
 * @access Private
 * @param {string} pageId
 * @body {string} groupId, progressId, [title], [schedule], [content]
 * @returns {Object} {task} created task object
 */
router.post(
   '/new/:pageId',
   auth,
   validate(validateCreateTask),
   async (req, res) => {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }
      //   Prepare: Set up new task
      const { groupId, progressId, title, schedule, content } = req.body
      const newTask = {}
      if (title) newTask.title = title
      if (schedule) newTask.schedule = schedule
      if (content) newTask.content = content

      //   Prepare: Set up new taskMap
      const groupIndex = page.groupOrder.indexOf(groupId)
      const progressIndex = page.progressOrder.indexOf(progressId)
      //   Validation: Check if group and progress exist
      if (groupIndex === -1) {
         return sendErrorResponse(res, 404, 'group', 'access')
      }
      if (progressIndex === -1) {
         return sendErrorResponse(res, 404, 'progress', 'access')
      }
      const taskMapIndex =
         groupIndex * page.progressOrder.length + progressIndex
      let newTaskMap = page.taskMap.slice()
      for (let i = taskMapIndex; i < newTaskMap.length; i++) {
         newTaskMap[i]++
      }
      try {
         // Data: Add new task
         const task = await prisma.task.create({
            data: newTask
         })

         // Get current page
         const currentPage = await prisma.page.findUnique({
            where: { id: req.params.pageId }
         })

         // Update task array and insert new task at correct position
         const updatedTaskIds = [...currentPage.tasks]
         updatedTaskIds.splice(newTaskMap[taskMapIndex] - 1, 0, task.id)

         // Data: Update page with new task
         const newPage = await prisma.page.update({
            where: { id: req.params.pageId },
            data: {
               tasks: updatedTaskIds,
               updateDate: new Date()
            }
         })

         // Data: Update page's taskMap
         await prisma.page.update({
            where: { id: req.params.pageId },
            data: { taskMap: newTaskMap }
         })

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
 * @body {string} taskId, slotIndex, accountEmail, calendarId, syncAction
 * @returns {Object} {task, event} updated task and calendar event
 */
router.post(
   '/sync-google-event',
   auth,
   validate(validateSyncGoogleEvent),
   async (req, res) => {
      try {
         const { taskId, slotIndex, accountEmail, calendarId, syncAction } =
            req.body

         const result = await syncTaskSlotWithGoogleHelper(
            taskId,
            slotIndex,
            accountEmail,
            calendarId,
            req.user.id,
            syncAction
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
   }
)

/**
 * @route PUT api/task/basic/:pageId/:taskId
 * @desc Update task title and content
 * @access Private
 * @param {string} pageId, taskId
 * @body {string} [title], [content]
 * @returns {Object} Updated task object
 */
router.put(
   '/basic/:pageId/:taskId',
   auth,
   validate(validateUpdateTaskBasic),
   async (req, res) => {
      try {
         // Validation: Check if page exists and user is the owner
         const page = await validatePage(req.params.pageId, req.user.id)
         if (!page) {
            return sendErrorResponse(res, 404, 'page', 'access')
         }

         const { title, content } = req.body
         const result = await updateTaskBasicInfo(
            req.params.taskId,
            req.params.pageId,
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
   }
)

/**
 * @route PUT api/task/move/:pageId/:taskId
 * @desc Move task to different group/progress
 * @access Private
 * @param {string} pageId, taskId
 * @body {string} [groupId], [progressId]
 * @returns {Object} Updated task object
 */
router.put(
   '/move/:pageId/:taskId',
   auth,
   validate(validateMoveTask),
   async (req, res) => {
      try {
         // Validation: Check if page exists and user is the owner
         const page = await validatePage(req.params.pageId, req.user.id)
         if (!page) {
            return sendErrorResponse(res, 404, 'page', 'access')
         }

         const { groupId, progressId } = req.body
         if (!groupId && !progressId) {
            return sendErrorResponse(res, 400, 'validation', 'failed')
         }

         const result = await moveTask(req.params.taskId, req.params.pageId, {
            groupId,
            progressId
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
   }
)

/**
 * @route PUT api/task/schedule/:pageId/:taskId/:slotIndex
 * @desc Update task schedule slot time
 * @access Private
 * @param {string} pageId, taskId, slotIndex
 * @body {string} [start], [end]
 * @returns {Object} Updated task object
 */
router.put(
   '/schedule/:pageId/:taskId/:slotIndex',
   auth,
   validate(validateUpdateTaskSchedule),
   async (req, res) => {
      try {
         // Validation: Check if page exists and user is the owner
         const page = await validatePage(req.params.pageId, req.user.id)
         if (!page) {
            return sendErrorResponse(res, 404, 'page', 'access')
         }

         const slotIndex = parseInt(req.params.slotIndex)
         if (isNaN(slotIndex)) {
            return sendErrorResponse(res, 400, 'validation', 'failed')
         }

         const { start, end } = req.body

         const result = await updateTaskSchedule(
            req.params.taskId,
            req.params.pageId,
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
 * @route POST api/task/schedule/:pageId/:taskId
 * @desc Add new schedule slot to task
 * @access Private
 * @param {string} pageId, taskId
 * @body {string} start, end
 * @returns {Object} {task, newSlotIndex}
 */
router.post(
   '/schedule/:pageId/:taskId',
   auth,
   validate(validateAddTaskScheduleSlot),
   async (req, res) => {
      try {
         // Validation: Check if page exists and user is the owner
         const page = await validatePage(req.params.pageId, req.user.id)
         if (!page) {
            return sendErrorResponse(res, 404, 'page', 'access')
         }

         const { start, end } = req.body
         if (!start || !end) {
            return sendErrorResponse(res, 400, 'validation', 'failed')
         }

         const result = await addTaskScheduleSlot(
            req.params.taskId,
            req.params.pageId,
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
   }
)

/**
 * @route DELETE api/task/schedule/:pageId/:taskId/:slotIndex
 * @desc Remove schedule slot from task
 * @access Private
 * @param {string} pageId, taskId, slotIndex
 * @returns {Object} Updated task object
 */
router.delete(
   '/schedule/:pageId/:taskId/:slotIndex',
   auth,
   validate(validateSlotParams),
   async (req, res) => {
      try {
         // Validation: Check if page exists and user is the owner
         const page = await validatePage(req.params.pageId, req.user.id)
         if (!page) {
            return sendErrorResponse(res, 404, 'page', 'access')
         }

         const slotIndex = parseInt(req.params.slotIndex)
         if (isNaN(slotIndex)) {
            return sendErrorResponse(res, 400, 'validation', 'failed')
         }

         const result = await removeTaskScheduleSlot(
            req.params.taskId,
            req.params.pageId,
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
 * @route DELETE api/task/:pageId/:taskId
 * @desc Delete task and associated Google Calendar events
 * @access Private
 * @param {string} pageId, taskId
 * @returns {Object} Empty response on success
 */
router.delete(
   '/:pageId/:taskId',
   auth,
   validate(validateTaskParams),
   async (req, res) => {
      const { taskId } = req.params
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }

      //   Validation: Check if task exists
      const task = await prisma.task.findUnique({
         where: { id: taskId }
      })
      if (!task) {
         return sendErrorResponse(res, 404, 'task', 'access')
      }

      // Delete associated Google Calendar events
      if (task.schedule && task.schedule.length > 0) {
         await deleteGoogleEventsForRemovedSlots(task.schedule, [], req.user.id)
      }

      //   Prepare: Set up new tasks array
      let newTasks = page.tasks.slice()
      const taskIndex = page.tasks.findIndex((t) => extractId(t) === taskId)
      newTasks.splice(taskIndex, 1)
      //   Prepare: Set up new taskMap
      let newTaskMap = page.taskMap.slice()
      for (let i = 0; i < newTaskMap.length; i++) {
         if (newTaskMap[i] > taskIndex) newTaskMap[i]--
      }

      try {
         await prisma.task.delete({ where: { id: taskId } })
         // Data: Update page's arrays
         await prisma.page.update({
            where: { id: req.params.pageId },
            data: {
               tasks: newTasks,
               taskMap: newTaskMap,
               updateDate: new Date()
            }
         })
         res.json()
      } catch (error) {
         sendErrorResponse(res, 500, 'task', 'delete', error)
      }
   }
)
module.exports = router
