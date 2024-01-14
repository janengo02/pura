const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const Group = require('../../models/Group')

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
   for (let i = 1; i <= page.progress_order.length; i++) {
      newTaskMap.push(0)
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
         .populate('tasks', ['title', 'schedule'])

      // Data: Update page's task_map
      newPage.task_map = newTaskMap
      newPage.save()

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
// @desc    Create a new group
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

   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Prepare: Set up new group
   const { title, color } = req.body
   const newGroup = {
      title: 'Untitled',
      update_date: new Date()
   }
   if (title && title !== '') newGroup.title = title
   if (color) newGroup.color = color

   try {
      // Data: update group
      const group = await Group.findOneAndUpdate(
         { _id: req.params.group_id },
         { $set: newGroup },
         { new: true }
      )

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

module.exports = router
