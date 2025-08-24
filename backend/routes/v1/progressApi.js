const express = require('express')
const router = express.Router()

const auth = require('../../middleware/auth')
const { validate } = require('../../middleware/validation')
const {
   validateCreateProgress,
   validateUpdateProgress,
   validateProgressParams
} = require('../../validators/progressValidators')

const { asyncHandler } = require('../../utils/asyncHandler')
const { NotFoundError } = require('../../utils/customErrors')
const { validatePage } = require('../../utils/pageHelpers')
const {
   validateProgress,
   prepareProgressData,
   createProgress,
   deleteProgress
} = require('../../utils/progressHelper')

const prisma = require('../../config/prisma')

/**
 * @route POST api/progress/new/:pageId
 * @desc Create new progress status
 * @access Private
 * @param {string} pageId
 * @body {string} title, titleColor, color
 * @returns {Object} {progress} created progress object
 */
router.post(
   '/new/:pageId',
   auth,
   validate(validateCreateProgress),
   asyncHandler(async (req, res) => {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) {
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )
      }
      //   Prepare: Set up new progress
      const newProgress = prepareProgressData(req.body)

      //   Prepare: Set up new taskMap
      const { taskMap: newTaskMap } = createProgress({
         progressOrder: page.progressOrder,
         groupOrder: page.groupOrder,
         taskMap: page.taskMap,
         newProgress
      })

      // Data: Add new progress
      const progress = await prisma.progress.create({
         data: newProgress
      })

      // Get current page
      const currentPage = await prisma.page.findUnique({
         where: { id: req.params.pageId }
      })

      if (!currentPage) {
         throw new NotFoundError('Page not found', 'page', 'find')
      }

      // Data: Update page with new progress
      await prisma.page.update({
         where: { id: req.params.pageId },
         data: {
            progressOrder: [...currentPage.progressOrder, progress.id],
            taskMap: newTaskMap,
            updateDate: new Date()
         }
      })

      res.json({ progress: progress })
   })
)

/**
 * @route POST api/progress/update/:pageId/:progressId
 * @desc Update progress properties
 * @access Private
 * @param {string} pageId, progressId
 * @body {string} [title], [titleColor], [color]
 * @returns {Object} Empty response on success
 */
router.post(
   '/update/:pageId/:progressId',
   auth,
   validate(validateUpdateProgress),
   asyncHandler(async (req, res) => {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) {
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )
      }

      //   Validation: Check if progress exists
      const progress = await validateProgress(req.params.progressId)
      if (!progress) {
         throw new NotFoundError('Progress not found', 'progress', 'access')
      }
      //   Prepare: Set up new progress
      const { title, titleColor, color } = req.body
      const updateData = { updateDate: new Date() }
      if (title) updateData.title = title
      if (titleColor) updateData.titleColor = titleColor
      if (color) updateData.color = color

      // Data: update progress
      await prisma.progress.update({
         where: { id: req.params.progressId },
         data: updateData
      })

      // Data: update page
      await prisma.page.update({
         where: { id: req.params.pageId },
         data: { updateDate: new Date() }
      })

      res.json()
   })
)

/**
 * @route DELETE api/progress/:pageId/:progressId
 * @desc Delete progress and all associated tasks
 * @access Private
 * @param {string} pageId, progressId
 * @returns {Object} Empty response on success
 */
router.delete(
   '/:pageId/:progressId',
   auth,
   validate(validateProgressParams),
   asyncHandler(async (req, res) => {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.pageId, req.user.id)
      if (!page) {
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )
      }

      //   Validation: Check if progress exists
      const progress = await validateProgress(req.params.progressId)
      if (!progress) {
         throw new NotFoundError('Progress not found', 'progress', 'access')
      }
      //   Prepare: Set up new tasks array & taskMap
      const {
         progressOrder: newProgressOrder,
         tasks: newTasks,
         taskMap: newTaskMap
      } = deleteProgress({
         progressIndex: page.progressOrder.indexOf(req.params.progressId),
         progressOrder: page.progressOrder,
         groupOrder: page.groupOrder,
         tasks: page.tasks,
         taskMap: page.taskMap
      })

      // Delete tasks from DB if they're not in newTasks
      const tasksToDelete = page.tasks.filter(
         (taskId) => !newTasks.includes(taskId)
      )
      for (let taskId of tasksToDelete) {
         await prisma.task.delete({ where: { id: taskId } })
      }

      // Data: Delete progress
      await prisma.progress.delete({ where: { id: req.params.progressId } })

      // Data: Update page's arrays
      await prisma.page.update({
         where: { id: req.params.pageId },
         data: {
            progressOrder: newProgressOrder,
            tasks: newTasks,
            taskMap: newTaskMap,
            updateDate: new Date()
         }
      })
      res.json()
   })
)

module.exports = router
