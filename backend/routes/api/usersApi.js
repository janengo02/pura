// =============================================================================
// IMPORTS
// =============================================================================

const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')

// Models
const Page = require('../../models/PageModel')
const User = require('../../models/UserModel')
const Group = require('../../models/GroupModel')
const Progress = require('../../models/ProgressModel')
const Task = require('../../models/TaskModel')

// Utils
const dotenv = require('dotenv')
const { sendErrorResponse } = require('../../utils/responseHelper')

dotenv.config()

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get default titles based on language
 * @param {string} language - Language code ('en' or 'ja')
 * @returns {Object} Object containing default titles for different entities
 */
const getDefaultTitles = (language = 'en') => {
   const translations = {
      en: {
         page: 'MY PURA',
         group: 'MY GROUP',
         progress: {
            todo: 'To do',
            inProgress: 'In Progress',
            done: 'Done'
         },
         task: 'My task'
      },
      ja: {
         page: 'マイプラ',
         group: 'マイグループ',
         progress: {
            todo: 'やること',
            inProgress: '進行中',
            done: '完了'
         },
         task: 'マイタスク'
      }
   }

   // Return English as fallback if language not supported
   return translations[language] || translations.en
}

/**
 * Create default progress entities with localized titles
 * @param {string} language - Language code
 * @returns {Promise<Array>} Array of created progress objects
 */
const createDefaultProgresses = async (language) => {
   const titles = getDefaultTitles(language)

   const progress1 = new Progress({
      title: titles.progress.todo,
      title_color: 'kanban.progress.title.red',
      color: 'kanban.progress.red'
   })
   await progress1.save()

   const progress2 = new Progress({
      title: titles.progress.inProgress,
      title_color: 'kanban.progress.title.orange',
      color: 'kanban.progress.orange'
   })
   await progress2.save()

   const progress3 = new Progress({
      title: titles.progress.done,
      title_color: 'kanban.progress.title.green',
      color: 'kanban.progress.green'
   })
   await progress3.save()

   return [progress1, progress2, progress3]
}

/**
 * Create default group with localized title
 * @param {string} language - Language code
 * @returns {Promise<Object>} Created group object
 */
const createDefaultGroup = async (language) => {
   const titles = getDefaultTitles(language)

   const group = new Group({
      title: titles.group
   })
   await group.save()

   return group
}

/**
 * Create default task with localized title
 * @param {string} language - Language code
 * @returns {Promise<Object>} Created task object
 */
const createDefaultTask = async (language) => {
   const titles = getDefaultTitles(language)

   const task = new Task({
      title: titles.task
   })
   await task.save()

   return task
}

/**
 * Create default page with localized title
 * @param {Object} user - User object
 * @param {Array} progresses - Array of progress objects
 * @param {Object} group - Group object
 * @param {Object} task - Task object
 * @param {string} language - Language code
 * @returns {Promise<Object>} Created page object
 */
const createDefaultPage = async (user, progresses, group, task, language) => {
   const titles = getDefaultTitles(language)

   const page = new Page({
      user: user,
      title: titles.page,
      progress_order: progresses,
      group_order: [group],
      task_map: [1, 1, 1], // One task across three progress columns
      tasks: [task]
   })
   await page.save()

   return page
}

// =============================================================================
// ROUTES
// =============================================================================

/**
 * @route POST api/users
 * @desc Register new user with localized default content
 * @access Public
 * @body {string} name, email, password, [language='en']
 * @returns {Object} {token, message} on success
 */
router.post(
   '/',
   [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
      check(
         'password',
         'Please enter a password with 6 or more characters'
      ).isLength({ min: 6 }),
      check('language', 'Language must be a valid language code')
         .optional()
         .isIn(['en', 'ja'])
   ],
   async (req, res) => {
      // -------------------------------------------------------------------------
      // VALIDATION
      // -------------------------------------------------------------------------

      // Validate form input
      const result = validationResult(req)
      if (!result.isEmpty()) {
         return sendErrorResponse(res, 400, 'validation', 'failed')
      }

      // Extract data with language defaulting to English
      const { name, email, password, language = 'en' } = req.body

      // Check if user already exists
      let user = await User.findOne({ email })
      if (user) {
         return sendErrorResponse(res, 400, 'auth', 'register')
      }

      // -------------------------------------------------------------------------
      // USER CREATION
      // -------------------------------------------------------------------------

      try {
         // Set up avatar
         const avatar = gravatar.url(email, {
            s: '200',
            r: 'pg',
            d: 'mm'
         })

         // Create new user
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

         // -------------------------------------------------------------------------
         // DEFAULT CONTENT CREATION
         // -------------------------------------------------------------------------

         // Create default content with localized titles
         const progresses = await createDefaultProgresses(language)
         const group = await createDefaultGroup(language)
         const task = await createDefaultTask(language)
         const page = await createDefaultPage(
            user,
            progresses,
            group,
            task,
            language
         )

         // -------------------------------------------------------------------------
         // RESPONSE
         // -------------------------------------------------------------------------

         // Generate JWT token
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
               if (err) {
                  return sendErrorResponse(res, 500, 'auth', 'register', err)
               }

               res.json({
                  token,
                  message: 'User registered successfully with localized content'
               })
            }
         )
      } catch (err) {
         sendErrorResponse(res, 500, 'auth', 'register', err)
      }
   }
)

// =============================================================================
// EXPORT
// =============================================================================

module.exports = router
