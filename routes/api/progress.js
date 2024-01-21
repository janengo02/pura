const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const Progress = require('../../models/Progress')

// @route   POST api/progress/new/:page-id
// @desc    Create a new progress
// @access  Private
router.post('/new/:page_id', [auth], async (req, res) => {
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
            { code: '401', title: 'alert-oops', msg: 'alert-user-unauthorize' }
         ]
      })
   }
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }
   //   Prepare: Set up new progress
   const { title, title_color, color } = req.body
   const newProgress = {}
   if (title) newProgress.title = title
   if (title_color) newProgress.title_color = title_color
   if (color) newProgress.color = color

   //   Prepare: Set up new task_map
   var newTaskMap = page.task_map
   if (page.group_order.length > 0) {
      const n_group = page.group_order.length
      const m_progress = page.progress_order.length + 1
      for (let i = 1; i <= n_group; i++) {
         task_count = newTaskMap[i * m_progress - 2]
         newTaskMap.splice(i * m_progress - 1, 0, task_count)
      }
   }

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

      res.json(newPage)
   } catch (error) {
      console.error('---ERROR---: ' + error.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   POST api/progress/update/:page-id/:progress-id
// @desc    Update progress
// @access  Private
router.post('/update/:page_id/:progress_id', [auth], async (req, res) => {
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
            { code: '401', title: 'alert-oops', msg: 'alert-user-unauthorize' }
         ]
      })
   }

   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Validation: Check if progress exists
   const progress = await Progress.findById(req.params.progress_id)
   if (!progress) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-progress-notfound' }
         ]
      })
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

      res.json(newPage)
   } catch (error) {
      console.error('---ERROR---: ' + error.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   DELETE api/group/:page-id/:progress-id
// @desc    Delete a progress
// @access  Private
router.delete('/:page_id/:progress_id', [auth], async (req, res) => {
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
            { code: '401', title: 'alert-oops', msg: 'alert-user-unauthorize' }
         ]
      })
   }

   //   Validation: Check if group exists
   const progress = await Progress.findById(req.params.progress_id)
   if (!progress) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-group-notfound' }
         ]
      })
   }

   //   Prepare: Set up new tasks array & task_map
   var oldTasks = page.tasks
   var newTasks = []
   var oldTaskMap = page.task_map
   var newTaskMap = []
   const { progress_id } = req.params
   const progressIndex = page.progress_order.indexOf(progress_id)
   const groupCount = page.group_order.length
   const progressCount = page.progress_order.length

   var deletedCount = 0
   for (let i = 0; i < groupCount; i++) {
      for (let j = 0; j < progressCount; j++) {
         currentMap = i * progressCount + j
         currentMapCount = oldTaskMap[currentMap]
         prevMapCount = 0
         if (currentMap != 0) {
            prevMapCount = oldTaskMap[currentMap - 1]
         }
         if (j == progressIndex) {
            deletedCount += currentMapCount - prevMapCount
         } else {
            newMapCount = currentMapCount - deletedCount
            newTaskMap.push(newMapCount)
            for (let t = prevMapCount; t < currentMapCount; t++) {
               newTasks.push(oldTasks[t])
            }
         }
      }
   }

   //   Prepare: Set up new progress_order
   var newProgressOrder = page.progress_order
   newProgressOrder.splice(progressIndex, 1)

   try {
      // Data: Delete tasks
      for (let i = 0; i < oldTasks.length; i++) {
         if (!newTasks.includes(oldTasks[i])) {
            deletedTaskId = oldTasks[i]
            await Task.deleteOne({ _id: deletedTaskId })
         }
      }
      // Data: Delete progress
      await progress.deleteOne()

      // Data: Update page's arrays
      page.progress_order = newProgressOrder
      page.tasks = newTasks
      page.task_map = newTaskMap
      await page.save()
      // Data: Get new page
      const newPage = await Page.findOneAndUpdate(
         { _id: req.params.page_id },
         {
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

      res.json(newPage)
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
