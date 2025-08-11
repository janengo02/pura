const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
dotenv.config()

const { validationResult } = require('express-validator')

const auth = require('../../middleware/auth')
const { sendErrorResponse } = require('../../utils/responseHelper')
const { validatePage, moveTask } = require('../../utils/pageHelpers')

const Page = require('../../models/PageModel')
/**
 * @route GET api/page
 * @desc Get first page of user
 * @access Private
 * @returns {Object} Page with progress_order, group_order, tasks, task_map
 */
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
         .populate('tasks', ['title', 'schedule', 'content'])
      res.json(page)
   } catch (err) {
      sendErrorResponse(res, 500, 'page', 'access', err)
   }
})

/**
 * @route GET api/page/:id
 * @desc Get page by ID
 * @access Private
 * @param {string} id
 * @returns {Object} Page with populated data
 */
router.get('/:id', auth, async (req, res) => {
   try {
      const page = await validatePage(req.params.id, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'page', 'access')
      }
      await page
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule', 'content'])
      res.json(page)
   } catch (err) {
      sendErrorResponse(res, 500, 'page', 'access', err)
   }
})

/**
 * @route POST api/page
 * @desc Create new page
 * @access Private
 * @body {string} [title]
 * @returns {Object} Created page object
 */
router.post('/', [auth], async (req, res) => {
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return sendErrorResponse(res, 400, 'validation', 'failed')
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
      const page = new Page(newPage)
      await page.save()

      res.json(page)
   } catch (error) {
      sendErrorResponse(res, 500, 'page', 'create', error)
   }
})

/**
 * @route POST api/page/move-task/:id
 * @desc Move task position in page
 * @access Private
 * @param {string} id
 * @body {Object} result - drag/drop result with destination, source, draggableId
 * @returns {Object} Empty response on success
 */
router.post('/move-task/:id', [auth], async (req, res) => {
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.id, req.user.id)
   if (!page) {
      return sendErrorResponse(res, 404, 'page', 'access')
   }
   const { destination, source, draggableId } = req.body.result

   try {
      const { tasks: newTaskArray, task_map: newTaskMap } = moveTask({
         tasks: page.tasks,
         task_map: page.task_map,
         destination,
         source,
         draggableId
      })

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
         .populate('tasks', ['title', 'schedule', 'content'])

      // Data: Update page's task_map
      newPage.task_map = newTaskMap
      await newPage.save()
      res.json()
   } catch (err) {
      sendErrorResponse(res, 500, 'page', 'update', err)
   }
})
module.exports = router
