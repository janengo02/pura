const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const Task = require('../../models/Task')

// @route   GET POST api/task/:page-id/:task-id
// @desc    Get task info
// @access  Private
router.get('/:page_id/:task_id', auth, async (req, res) => {
   try {
      //   Validation: Check if page exists
      const page = await Page.findById(req.params.page_id)
      if (!page) {
         return res.status(404).json({ msg: 'Page not found' })
      }
      //   Validation: Check if user is the owner
      if (page.user.toString() !== req.user.id) {
         return res.status(401).json({ msg: 'User not authorized' })
      }

      //   Validation: Check if task exists
      const task = await Task.findById(req.params.task_id)
      // TODO: return task's group and progress
      res.json(task)
   } catch (err) {
      console.error('---ERROR---: ' + err.message)

      if (err.kind === 'ObjectId') {
         return res.status(404).json({
            errors: [
               { code: '404', title: 'alert-oops', msg: 'alert-task-notfound' }
            ]
         })
      }
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
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
               {
                  code: '401',
                  title: 'alert-oops',
                  msg: 'alert-user-unauthorize'
               }
            ]
         })
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
         return res.status(404).json({
            errors: [
               { title: 'alert-oops', msg: 'alert-group_progress-notfound' }
            ]
         })
      }
      const taskMapIndex = groupId * page.progress_order.length + progressId
      var newTaskMap = page.task_map
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
            .populate('tasks', ['title', 'is_scheduled'])

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
   }
)

// @route   POST api/task/update/:page-id/:task-id
// @desc    Update a task
// @access  Private
router.post('/update/:page_id/:task_id', [auth], async (req, res) => {
   //   Validation: Check if page exists
   const page = await Page.findById(req.params.page_id)
   if (!page) {
      return res.status(404).json({ msg: 'Page not found' })
   }
   //   Validation: Check if user is the owner
   if (page.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' })
   }
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Validation: Check if task exists
   const task = await Task.findById(req.params.task_id)
   if (!task) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-task-notfound' }
         ]
      })
   }
   //   Prepare: Set up new task
   const { title, schedule, google_events, content, target_task } = req.body
   task.update_date = new Date()
   if (title) task.title = title
   if (schedule) task.schedule = schedule
   if (google_events) task.google_events = google_events
   if (content) task.content = content
   if (target_task) {
      if (title) target_task.title = title
      if (schedule) target_task.schedule = schedule
      if (google_events) target_task.google_events = google_events
      if (content) target_task.content = content
   }
   try {
      await task.save()
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
         .populate('tasks', ['title', 'is_scheduled'])

      res.json({ page: newPage, task: target_task })
   } catch (error) {
      console.error('---ERROR---: ' + error.message)
      res.status(500).json({
         errors: [
            { code: '500', title: 'alert-oops', msg: 'alert-server_error' }
         ]
      })
   }
})

// @route   DELETE api/task/:page-id/:task-id
// @desc    Delete a task
// @access  Private
router.delete('/:page_id/:task_id', [auth], async (req, res) => {
   //   Validation: Check if page exists
   const page = await Page.findById(req.params.page_id)
   if (!page) {
      return res.status(404).json({ msg: 'Page not found' })
   }
   //   Validation: Check if user is the owner
   if (page.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' })
   }

   //   Validation: Check if task exists
   const task = await Task.findById(req.params.task_id)
   if (!task) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-task-notfound' }
         ]
      })
   }
   //   Prepare: Set up new tasks array
   const { task_id } = req.params
   var newTasks = page.tasks
   const taskIndex = newTasks.indexOf(task_id)
   newTasks.splice(taskIndex, 1)

   //   Prepare: Set up new task_map
   var newTaskMap = page.task_map
   for (let i = 0; i < newTaskMap.length; i++) {
      if (newTaskMap[i] > taskIndex) newTaskMap[i]--
   }

   try {
      await Task.deleteOne({ _id: task_id })
      // Data: Update page's arrays
      page.tasks = newTasks
      page.task_map = newTaskMap
      await page.save()
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
         .populate('tasks', ['title', 'is_scheduled'])

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
