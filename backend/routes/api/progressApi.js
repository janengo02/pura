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

const { createProgress, deleteProgress } = require('../../../shared/utils')

// @route   POST api/progress/new/:page-id
// @desc    Create a new progress
// @access  Private
router.post('/new/:page_id', [auth], async (req, res) => {
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.page_id, req.user.id)
   if (!page) {
      return sendErrorResponse(res, 404, 'alert-oops', 'alert-page-notfound')
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

      res.json({ progress_id: progress._id })
   } catch (error) {
      return sendErrorResponse(
         res,
         500,
         'alert-oops',
         'alert-server_error',
         error
      )
   }
})

// @route   POST api/progress/update/:page-id/:progress-id
// @desc    Update progress
// @access  Private
router.post('/update/:page_id/:progress_id', [auth], async (req, res) => {
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.page_id, req.user.id)
   if (!page) {
      return sendErrorResponse(res, 404, 'alert-oops', 'alert-page-notfound')
   }

   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Validation: Check if progress exists
   const progress = await validateProgress(req.params.progress_id)
   if (!progress) {
      return sendErrorResponse(
         res,
         404,
         'alert-oops',
         'alert-progress-notfound'
      )
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
      return sendErrorResponse(
         res,
         500,
         'alert-oops',
         'alert-server_error',
         error
      )
   }
})

// @route   DELETE api/group/:page-id/:progress-id
// @desc    Delete a progress
// @access  Private
router.delete('/:page_id/:progress_id', [auth], async (req, res) => {
   try {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'alert-oops', 'alert-page-notfound')
      }

      //   Validation: Check if progress exists
      const progress = await validateProgress(req.params.progress_id)
      if (!progress) {
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'alert-progress-notfound'
         )
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
      return sendErrorResponse(
         res,
         500,
         'alert-oops',
         'alert-server_error',
         error
      )
   }
})

module.exports = router
