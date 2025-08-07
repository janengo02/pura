const express = require('express')
const router = express.Router()

const auth = require('../../middleware/auth')
const { validationResult } = require('express-validator')

const { sendErrorResponse } = require('../../utils/responseHelper')
const { validatePage } = require('../../utils/pageHelpers')
const {
   validateProgress,
   prepareProgressData
} = require('../../utils/progressHelper')

const Page = require('../../models/PageModel')
const Progress = require('../../models/ProgressModel')
const Task = require('../../models/TaskModel')

const { createProgress, deleteProgress } = require('../../../shared/utils')

/**
 * @route POST api/progress/new/:page_id
 * @desc Create new progress status
 * @access Private
 * @param {string} page_id
 * @body {string} title, title_color, color
 * @returns {Object} {progress} created progress object
 */
router.post('/new/:page_id', [auth], async (req, res) => {
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
   //   Prepare: Set up new progress
   const newProgress = prepareProgressData(req.body)

   //   Prepare: Set up new task_map
   const { task_map: newTaskMap } = createProgress({
      progress_order: page.progress_order,
      group_order: page.group_order,
      task_map: page.task_map,
      newProgress
   })

   try {
      // Data: Add new progress
      const progress = new Progress(newProgress)
      await progress.save()

      // Data: Add new progress to page
      const newPage = await Page.findOneAndUpdate(
         { _id: req.params.page_id },
         {
            $push: { progress_order: progress },
            $set: { update_date: new Date() }
         },
         { new: true }
      )

      // Data: Update page's task_map
      newPage.task_map = newTaskMap
      await newPage.save()

      res.json({ progress: progress })
   } catch (error) {
      return sendErrorResponse(res, 500, 'progress', 'create', error)
   }
})

/**
 * @route POST api/progress/update/:page_id/:progress_id
 * @desc Update progress properties
 * @access Private
 * @param {string} page_id, progress_id
 * @body {string} [title], [title_color], [color]
 * @returns {Object} Empty response on success
 */
router.post('/update/:page_id/:progress_id', [auth], async (req, res) => {
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

   //   Validation: Check if progress exists
   const progress = await validateProgress(req.params.progress_id)
   if (!progress) {
      return sendErrorResponse(res, 404, 'progress', 'access')
   }
   //   Prepare: Set up new progress
   const { title, title_color, color } = req.body
   progress.update_date = new Date()
   if (title) progress.title = title
   if (title_color) progress.title_color = title_color
   if (color) progress.color = color

   try {
      // Data: update group
      await progress.save()

      // Data: get new page
      await Page.findOneAndUpdate(
         { _id: req.params.page_id },
         { $set: { update_date: new Date() } },
         { new: true }
      )

      res.json()
   } catch (error) {
      return sendErrorResponse(res, 500, 'progress', 'update', error)
   }
})

/**
 * @route DELETE api/progress/:page_id/:progress_id
 * @desc Delete progress and all associated tasks
 * @access Private
 * @param {string} page_id, progress_id
 * @returns {Object} Empty response on success
 */
router.delete('/:page_id/:progress_id', [auth], async (req, res) => {
   try {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }

      //   Validation: Check if progress exists
      const progress = await validateProgress(req.params.progress_id)
      if (!progress) {
         return sendErrorResponse(res, 404, 'progress', 'access')
      }
      //   Prepare: Set up new tasks array & task_map
      const {
         progress_order: newProgressOrder,
         tasks: newTasks,
         task_map: newTaskMap
      } = deleteProgress({
         progressIndex: page.progress_order.indexOf(req.params.progress_id),
         progress_order: page.progress_order,
         group_order: page.group_order,
         tasks: page.tasks,
         task_map: page.task_map
      })

      // Delete tasks from DB if they're not in newTasks
      const tasksToDelete = page.tasks.filter(
         (taskId) => !newTasks.some((newTaskId) => taskId.equals(newTaskId))
      )
      for (let taskId of tasksToDelete) {
         await Task.deleteOne({ _id: taskId })
      }

      // Data: Delete progress
      await progress.deleteOne()

      // Data: Update page's arrays
      page.progress_order = newProgressOrder
      page.tasks = newTasks
      page.task_map = newTaskMap
      page.update_date = new Date()
      await page.save()
      res.json()
   } catch (error) {
      return sendErrorResponse(res, 500, 'progress', 'delete', error)
   }
})

module.exports = router
