const express = require('express')
const router = express.Router()
const auth = require('../../middleware/auth')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/Page')

// @route   GET api/page
// @desc    Get the first page of the user (temporary)
// @access  Private
router.get('/', auth, async (req, res) => {
   try {
      const page = await Page.findOne({ user: req.user.id })
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])
      res.json(page)
   } catch (err) {
      console.error(err.message)
      if (err.kind === 'ObjectId') {
         return res.status(404).json({
            errors: [{ title: 'alert-oops', msg: 'alert-page-notfound' }]
         })
      }
      res.status(500).send('Server Error')
   }
})

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
         return res.status(404).json({
            errors: [{ title: 'alert-oops', msg: 'alert-page-notfound' }]
         })
      }
      // Check if the user is the owner of the page
      if (page.user.toString() !== req.user.id) {
         return res.status(401).json({
            errors: [{ title: 'alert-oops', msg: 'alert-user-unauthorize' }]
         })
      }
      res.json(page)
   } catch (err) {
      console.error(err.message)
      if (err.kind === 'ObjectId') {
         return res.status(404).json({
            errors: [{ title: 'alert-oops', msg: 'alert-page-notfound' }]
         })
      }
      res.status(500).send('Server Error')
   }
})

// @route   POST api/page
// @desc    Create a page
// @access  Private
router.post('/', [auth], async (req, res) => {
   //   Validation: Form input
   const result = validationResult(req)
   if (!result.isEmpty()) {
      return res.status(400).json({ errors: result.array() })
   }

   //   Prepare: Set up new page
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
   try {
      // Data: Add new page
      page = new Page(newPage)
      await page.save()

      res.json(page)
   } catch (error) {
      console.error('---ERROR---: ' + error.message)
      res.status(500).send('Server Error')
   }
})

module.exports = router
