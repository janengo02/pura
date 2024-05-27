const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const Group = require('../../models/Group')
const Task = require('../../models/Task')

// @route   POST api/group/new/:page-id
// @desc    Create a new group
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

   //   Prepare: Set up new group
   const { title, color } = req.body
   const newGroup = {}
   if (title) newGroup.title = title
   if (color) newGroup.color = color

   //   Prepare: Set up new task_map
   var newTaskMap = page.task_map
   var task_count = page.tasks.length
   for (let i = 1; i <= page.progress_order.length; i++) {
      newTaskMap.push(task_count)
   }

   try {
      // Data: Add new group
      const group = new Group(newGroup)
      await group.save()

      // Data: Add new group to page
      const newPage = await Page.findOneAndUpdate(
         { _id: req.params.page_id },
         {
            $push: { group_order: group },
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
})

// @route   POST api/group/update/:page-id/:group-id
// @desc    Update group
// @access  Private
router.post('/update/:page_id/:group_id', [auth], async (req, res) => {
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
   const group = await Group.findById(req.params.group_id)
   if (!group) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-group-notfound' }
         ]
      })
   }

   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Prepare: Set up new group
   const { title, color } = req.body
   group.update_date = new Date()
   if (title) group.title = title
   if (color) group.color = color

   try {
      // Data: update group
      await group.save()
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

// @route   DELETE api/group/:page-id/:group-id
// @desc    Delete a group
// @access  Private
router.delete('/:page_id/:group_id', [auth], async (req, res) => {
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
   const group = await Group.findById(req.params.group_id)
   if (!group) {
      return res.status(404).json({
         errors: [
            { code: '404', title: 'alert-oops', msg: 'alert-group-notfound' }
         ]
      })
   }

   //   Prepare: Set up new tasks array
   var newTasks = page.tasks
   var newTaskMap = page.task_map
   const { group_id } = req.params
   const groupIndex = page.group_order.indexOf(group_id)
   const progressCount = page.progress_order.length
   const mapStart = progressCount * groupIndex
   const mapEnd = mapStart + progressCount - 1
   var newTaskStart = 0
   if (mapStart !== 0) {
      newTaskStart = newTaskMap[mapStart - 1]
   }
   newTaskEnd = newTaskMap[mapEnd] - 1

   //   Prepare: Set up new group_order
   var newGroupOrder = page.group_order
   newGroupOrder.splice(groupIndex, 1)

   //   Prepare: Set up new task_map
   var taskCount = newTaskMap[mapEnd]
   if (mapStart !== 0) {
      taskCount = newTaskMap[mapEnd] - newTaskMap[mapStart - 1]
   }
   for (let i = mapEnd + 1; i < newTaskMap.length; i++) {
      newTaskMap[i] -= taskCount
   }
   newTaskMap.splice(mapStart, mapEnd - mapStart + 1)

   try {
      // Data: Delete tasks

      for (let i = newTaskStart; i <= newTaskEnd; i++) {
         deletedTaskId = newTasks[i]
         await Task.deleteOne({ _id: deletedTaskId })
      }
      newTasks.splice(newTaskStart, newTaskEnd - newTaskStart + 1)

      // Data: Delete group
      await group.deleteOne()

      // Data: Update page's arrays
      page.group_order = newGroupOrder
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
