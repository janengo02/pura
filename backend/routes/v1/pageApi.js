const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
dotenv.config()

const { validate } = require('../../middleware/validation')
const {
   validatePageParam,
   validateCreatePage,
   validateDropTask
} = require('../../validators/pageValidators')

const auth = require('../../middleware/auth')
const { asyncHandler } = require('../../utils/asyncHandler')
const { NotFoundError } = require('../../utils/customErrors')
const {
   validatePage,
   moveTask,
   populatePage
} = require('../../utils/pageHelpers')

const prisma = require('../../config/prisma')

/**
 * @route GET api/page
 * @desc Get first page of user
 * @access Private
 * @returns {Object} Page with progressOrder, groupOrder, tasks, taskMap
 */
router.get(
   '/',
   auth,
   asyncHandler(async (req, res) => {
      const page = await prisma.page.findFirst({
         where: { userId: req.user.id }
      })

      const populatedPage = await populatePage(page)
      res.json(populatedPage)
   })
)

/**
 * @route GET api/page/:id
 * @desc Get page by ID
 * @access Private
 * @param {string} id
 * @returns {Object} Page with populated data
 */
router.get(
   '/:id',
   auth,
   validate(validatePageParam),
   asyncHandler(async (req, res) => {
      const page = await validatePage(req.params.id, req.user.id)
      if (!page) {
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )
      }

      const populatedPage = await populatePage(page)
      res.json(populatedPage)
   })
)

/**
 * @route POST api/page
 * @desc Create new page
 * @access Private
 * @body {string} [title]
 * @returns {Object} Created page object
 */
router.post(
   '/',
   auth,
   validate(validateCreatePage),
   asyncHandler(async (req, res) => {
      //   Prepare: Set up new page
      const newPageData = {
         userId: req.user.id,
         progressOrder: [],
         groupOrder: [],
         taskMap: [],
         tasks: []
      }
      if (req.body.title) {
         newPageData.title = req.body.title
      }

      // Data: Add new page
      const page = await prisma.page.create({
         data: newPageData
      })

      res.json(page)
   })
)

/**
 * @route POST api/page/move-task/:id
 * @desc Move task position in page
 * @access Private
 * @param {string} id
 * @body {Object} result - drag/drop result with destination, source, draggableId
 * @returns {Object} Empty response on success
 */
router.post(
   '/move-task/:id',
   auth,
   validate(validateDropTask),
   asyncHandler(async (req, res) => {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.id, req.user.id)
      if (!page) {
         throw new NotFoundError(
            'Page not found or access denied',
            'page',
            'access'
         )
      }
      const { destination, source, draggableId } = req.body.result

      const { tasks: newTaskArray, taskMap: newTaskMap } = moveTask({
         tasks: page.tasks,
         taskMap: page.taskMap,
         destination,
         source,
         draggableId
      })

      // Data: Update page with new tasks and taskMap
      await prisma.page.update({
         where: { id: req.params.id },
         data: {
            tasks: newTaskArray,
            taskMap: newTaskMap,
            updateDate: new Date()
         }
      })
      res.json()
   })
)
module.exports = router
