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
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])
      if (!page) {
         return res.status(404).json({ msg: 'Page not found' })
      }
      // Check if the user is the owner of the page
      if (page.user.toString() !== req.user.id) {
         return res.status(401).json({ msg: 'User not authorized' })
      }
      //    TDOD
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
// @desc    Create or update a page
// @access  Private (need Token)
router.post(
   '/',
   [
      auth,
      check('title', 'Title is required').not().isEmpty(),
      check('skills', 'Skills are required').not().isEmpty()
   ],
   async (req, res) => {
      const result = validationResult(req)
      if (!result.isEmpty()) {
         return res.status(400).json({ errors: result.array() })
      }
      const {
         company,
         website,
         location,
         bio,
         status,
         githubusername,
         skills,
         youtube,
         twitter,
         facebook,
         linkedin,
         instagram
      } = req.body

      //Build profile object
      const profileFields = {}
      profileFields.user = req.user.id
      if (company) profileFields.company = company
      if (website) profileFields.website = website
      if (location) profileFields.location = location
      if (bio) profileFields.bio = bio
      if (status) profileFields.status = status
      if (githubusername) profileFields.githubusername = githubusername
      if (skills) {
         profileFields.skills = skills.split(',').map((skill) => skill.trim())
      }
      //   Build social object
      profileFields.social = {}
      if (youtube) profileFields.social.youtube = youtube
      if (twitter) profileFields.social.twitter = twitter
      if (facebook) profileFields.social.facebook = facebook
      if (linkedin) profileFields.social.linkedin = linkedin
      if (instagram) profileFields.social.instagram = instagram

      try {
         let profile = await Profile.findOne({ user: req.user.id })
         if (profile) {
            // Update
            profile = await Profile.findOneAndUpdate(
               { user: req.user.id },
               { $set: profileFields },
               { new: true }
            )
            return res.json(profile)
         }

         //  Create
         profile = new Profile(profileFields)
         await profile.save()
         return res.json(profile)
      } catch (err) {
         console.error(err.message)
         res.status(500).send('Server error')
      }
   }
)
