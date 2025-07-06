const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')

const Page = require('../../models/PageModel')
const User = require('../../models/UserModel')
const Group = require('../../models/GroupModel')
const Progress = require('../../models/ProgressModel')
const Task = require('../../models/TaskModel')
const dotenv = require('dotenv')
const { sendErrorResponse } = require('../../utils/responseHelper')

dotenv.config()

// @route   POST api/users
// @desc    Register user route
// @access  Public
router.post(
   '/',
   [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check(
         'password',
         'Please enter a password with 6 or more characters'
      ).isLength({ min: 6 })
   ],
   async (req, res) => {
      //   Validation: Form input
      const result = validationResult(req)
      if (!result.isEmpty()) {
         return sendErrorResponse(res, 400, 'alert-oops', result.array()[0].msg)
      }

      //   Validation: Check if user exists
      const { name, email, password } = req.body
      let user = await User.findOne({ email })
      if (user) {
         return sendErrorResponse(res, 400, 'alert-oops', 'alert-user-exists')
      }
      // Prepare: Set up avatar
      const avatar = gravatar.url(email, {
         s: '200',
         r: 'pg',
         d: 'mm'
      })
      try {
         // Data: Add new user
         user = new User({
            name,
            email,
            avatar,
            password
         })
         // Encrypt password
         const salt = await bcrypt.genSalt(10)
         user.password = await bcrypt.hash(password, salt)
         await user.save()

         // Data: Add default group
         group = new Group({
            title: 'MY GROUP'
         })
         await group.save()

         // Data: Add default progresses
         progress1 = new Progress({
            title: 'To do',
            title_color: '#B75151',
            color: '#FFE5E5'
         })
         await progress1.save()

         progress2 = new Progress({
            title: 'In Progress',
            title_color: '#E95F11',
            color: '#FFF0E4'
         })
         await progress2.save()

         progress3 = new Progress({
            title: 'Done',
            title_color: '#3E9C75',
            color: '#CDF4E4'
         })
         await progress3.save()

         // Data: Add default task
         task = new Task({
            title: 'My task'
         })
         await task.save()

         // Data: Add default page
         page = new Page({
            user: user,
            title: 'MY PURA',
            progress_order: [progress1, progress2, progress3],
            group_order: [group],
            task_map: [1, 1, 1],
            tasks: [task]
         })
         await page.save()

         // Return: json web token
         const payload = {
            user: {
               id: user.id
            }
         }

         jwt.sign(
            payload,
            process.env?.JWT_SECRET,
            { expiresIn: 36000 },
            (err, token) => {
               if (err) throw err
               res.json({ token })
            }
         )
      } catch (err) {
         console.error(err.message)
         sendErrorResponse(res, 500, 'alert-oops', 'alert-server_error', err)
      }
   }
)

module.exports = router
