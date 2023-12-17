const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')
const User = require('../../models/User')
const Group = require('../../models/Group')
const Progress = require('../../models/Progress')

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
         .populate('group_order.$*', ['title', 'color', 'visibility'])
      if (!page) {
         return res.status(404).json({ msg: 'Page not found' })
      }
      // Check if the user is the owner of the page
      if (page.user.toString() !== req.user.id) {
         return res.status(401).json({ msg: 'User not authorized' })
      }
      //    TDOD
   } catch (err) {
      console.error(err.message)
      if (err.kind === 'ObjectId') {
         return res.status(404).json({ msg: 'Page not found' })
      }
      res.status(500).send('Server Error')
   }
})
