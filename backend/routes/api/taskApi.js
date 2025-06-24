const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator')
const dotenv = require('dotenv')

const auth = require('../../middleware/auth')
const { sendErrorResponse } = require('../../utils/responseHelper')
const { validatePage } = require('../../utils/pageHelpers')
const { getNewMap } = require('../../utils/taskHelpers')

const User = require('../../models/UserModel')
const Page = require('../../models/PageModel')
const Task = require('../../models/TaskModel')
const Progress = require('../../models/ProgressModel')
const Group = require('../../models/GroupModel')

dotenv.config()

// @route   GET POST api/task/:page-id/:task-id
// @desc    Get task info
// @access  Private
router.get('/:page_id/:task_id', auth, async (req, res) => {
   try {
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'Page not found or unauthorized'
         )
      }
      const user = await User.findById(req.user.id)

      //   Validation: Check if task exists
      const task = await Task.findById(req.params.task_id)

      // Get group and progress data
      const { newGroupIndex, newProgressIndex } = getNewMap(
         page,
         req.params.task_id
      )
      const group = await Group.findById(page.group_order[newGroupIndex])
      const progress = await Progress.findById(
         page.progress_order[newProgressIndex]
      )
      const { _id, title, schedule, content, create_date, update_date } = task

      const response = {
         _id,
         title,
         schedule,
         content,
         create_date,
         update_date,
         group,
         progress
      }
      res.json(response)
   } catch (err) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
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
      //   Validation: Check if page exists and user is the owner
      const page = await validatePage(req.params.page_id, req.user.id)
      if (!page) {
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'alert-page-notfound or unauthorized'
         )
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
         return sendErrorResponse(
            res,
            404,
            'alert-oops',
            'alert-group_progress-notfound'
         )
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

         res.json({ task_id: task._id })
      } catch (error) {
         sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
      }
   }
)

// @route   POST api/task/update/:page-id/:task-id
// @desc    Update a task
// @access  Private
router.post('/update/:page_id/:task_id', [auth], async (req, res) => {
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.page_id, req.user.id)
   if (!page) {
      return sendErrorResponse(
         res,
         404,
         'alert-oops',
         'Page not found or unauthorized'
      )
   }
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Validation: Check if task exists
   const task = await Task.findById(req.params.task_id)
   if (!task) {
      return sendErrorResponse(res, 404, 'alert-oops', 'alert-task-notfound')
   }

   //   Prepare: Set up new task
   const { title, schedule, content, group_id, progress_id, task_detail_flg } =
      req.body
   task.update_date = new Date()
   if (title) task.title = title
   if (schedule) task.schedule = schedule
   if (content) task.content = content
   const currentSchedule = schedule
   try {
      if (!group_id && !progress_id) {
         await task.save()
      }
      if (task_detail_flg) {
         const { newTaskArray, newTaskMap, newGroupIndex, newProgressIndex } =
            getNewMap(page, req.params.task_id, group_id, progress_id)

         const newPageValues =
            progress_id || group_id
               ? { tasks: newTaskArray, update_date: new Date() }
               : { update_date: new Date() }
         const newPage = await Page.findOneAndUpdate(
            { _id: req.params.page_id },
            { $set: newPageValues },
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
         if (progress_id || group_id) {
            newPage.task_map = newTaskMap
            await newPage.save()
         }

         const group = await Group.findById(page.group_order[newGroupIndex])
         const progress = await Progress.findById(
            page.progress_order[newProgressIndex]
         )
         const { _id, title, content, create_date, update_date } = task
         const newTask = {
            _id,
            title,
            schedule: currentSchedule,
            content,
            create_date,
            update_date,
            group,
            progress
         }
         res.json({ page: newPage, task: newTask })
      } else {
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

         res.json({ page: newPage, task: {} })
      }
   } catch (error) {
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})

// @route   DELETE api/task/:page-id/:task-id
// @desc    Delete a task
// @access  Private
router.delete('/:page_id/:task_id', [auth], async (req, res) => {
   //   Validation: Check if page exists and user is the owner
   const page = await validatePage(req.params.page_id, req.user.id)
   if (!page) {
      return sendErrorResponse(
         res,
         404,
         'alert-oops',
         'Page not found or unauthorized'
      )
   }

   //   Validation: Check if task exists
   const task = await Task.findById(req.params.task_id)
   if (!task) {
      return sendErrorResponse(res, 404, 'alert-oops', 'alert-task-notfound')
   }
   //   Prepare: Set up new tasks array
   const { task_id } = req.params
   let newTasks = page.tasks.slice()
   const taskIndex = newTasks.indexOf(task_id)
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
      sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', error)
   }
})
module.exports = router
