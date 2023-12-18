const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const User = require('../../models/User')
const Group = require('../../models/Group')
const Progress = require('../../models/Progress')
const Task = require('../../models/Task')

// @route   GET api/page/:id
// @desc    Get page by page id
// @access  Private
router.get('/:id', auth, async (req, res) => {
   try {
      const page = await Page.findById(req.params.id)
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])
      if (!page) {
         return res.status(404).json({ msg: 'Page not found' })
      }
      // Check if the user is the owner of the page
      if (page.user.toString() !== req.user.id) {
         return res.status(401).json({ msg: 'User not authorized' })
      }
      res.json(page)
   } catch (err) {
      console.error(err.message)
      if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Page not found' })
      }
      res.status(500).send('Server Error')
   }
})

// @route   POST api/page
// @desc    Create a page
// @access  Private
router.post(
   '/',
   [
      auth,
      check('title', 'Title cannot be longer than 255 characters').isLength({
         max: 255
      })
   ],
   async (req, res) => {
      const result = validationResult(req)
      if (!result.isEmpty()) {
         return res.status(400).json({ errors: result.array() })
      }
      try {
         const newPage = {
            user: req.user.id,
            sync_accounts: [],
            progress_order: [],
            group_order: [],
            task_map: [],
            tasks: []
         }
         if (req.body.title) {
            newPage.title = req.body.title
         }
         page = new Page(newPage)
         await page.save()
         res.json(page)
      } catch (error) {
         console.error('---ERROR---: ' + error.message)
         res.status(500).send('Server Error')
      }
   }
)

module.exports = router
