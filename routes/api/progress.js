const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const Progress = require('../../models/Progress')

// @route   POST api/progress/:page-id
// @desc    Create a new progress
// @access  Private
router.post(
   '/:page_id',
   [
      auth,
      check('title', 'Title cannot be longer than 255 characters').isLength({
         max: 255
      })
   ],
   async (req, res) => {
      // Check if page exists and the user is the owner of the page
      const page = await Page.findById(req.params.page_id)
      if (!page) {
         return res.status(404).json({ msg: 'Page not found' })
      }
      if (page.user.toString() !== req.user.id) {
         return res.status(401).json({ msg: 'User not authorized' })
      }
      // Validation
      const result = validationResult(req)
      if (!result.isEmpty()) {
         return res.status(400).json({ errors: result.array() })
      }
      //   Create new group
      const { title, title_color, color } = req.body
      const newProgress = {}
      if (title) newProgress.title = title
      if (title_color) newProgress.title_color = title_color
      if (color) newProgress.color = color
      //   Update taskmap
      const newTaskMap = page.task_map
      // TODO: update newTaskMap
      try {
         const progress = new Progress(newProgress)
         await progress.save()

         const newPage = await Page.findOneAndUpdate(
            { _id: req.params.page_id },
            {
               $set: { task_map: newTaskMap },
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
         res.json(newPage)
      } catch (error) {
         console.error('---ERROR---: ' + error.message)
         res.status(500).send('Server Error')
      }
   }
)

module.exports = router
