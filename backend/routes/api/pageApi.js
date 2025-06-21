const express = require('express')
const router = express.Router()

const dotenv = require('dotenv')
dotenv.config()

const { validationResult } = require('express-validator')

const auth = require('../../middleware/auth')
const { sendErrorResponse } = require('../../utils/responseHelper')
const { validatePage } = require('../../utils/pageHelpers')

const Page = require('../../models/PageModel')
const { moveTask } = require('../../../shared/utils')

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
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   GET api/page/:id
// @desc    Get page by page id
// @access  Private
router.get('/:id', auth, async (req, res) => {
   try {
      const page = await validatePage(req.params.id, req.user.id)
      if (!page) {
         return sendErrorResponse(res, 404, 'alert-oops', 'alert-page-notfound')
      }
      await page
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
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})

// @route   POST api/page
// @desc    Create a page
// @access  Private
router.post('/', [auth], async (req, res) => {
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return sendErrorResponse(
         res,
         400,
         'alert-oops',
         'alert-validation-error',
         result.array()
      )
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
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})

// @route   POST api/page/move-task/:id
// @desc    Update page when move the position of a task
// @access  Private
router.post('/move-task/:id', [auth], async (req, res) => {
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.id, req.user.id)
   if (!page) {
      return sendErrorResponse(res, 404, 'alert-oops', 'alert-page-notfound')
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
         .populate('tasks', ['title', 'schedule'])

      // Data: Update page's task_map
      newPage.task_map = newTaskMap
      await newPage.save()
      res.json()
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
   }
})
module.exports = router
