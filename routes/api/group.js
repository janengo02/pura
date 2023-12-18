const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const Group = require('../../models/Group')

// @route   POST api/group/:page-id
// @desc    Create a new group
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
      const { title, color } = req.body
      const newGroup = {}
      if (title) newGroup.title = title
      if (color) newGroup.color = color
      //   Update taskmap
      const newGroupMap = Array(page.group_order.length).fill(0)

      try {
         const group = new Group(newGroup)
         await group.save()

         const newPage = await Page.findOneAndUpdate(
            { _id: req.params.page_id },
            {
               $push: { task_map: newGroupMap },
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
         res.json(newPage)
      } catch (error) {
         console.error('---ERROR---: ' + error.message)
         res.status(500).send('Server Error')
      }
   }
)

module.exports = router
