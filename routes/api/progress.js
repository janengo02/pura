const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const Progress = require('../../models/Progress')

// @route   POST api/progress/:page-id
// @desc    Create a new progress
// @access  Private
router.post('/:page_id', [auth], async (req, res) => {
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
         newTaskMap.splice(i * m_progress - 1, 0, 0)
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

module.exports = router
