// =============================================================================
// IMPORTS
// =============================================================================

const express = require('express')
const router = express.Router()
const gravatar = require('gravatar')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
// Prisma Client
const prisma = require('../../config/prisma')

// Utils
const dotenv = require('dotenv')
const { validate } = require('../../middleware/validation')
const { validateRegistration } = require('../../validators/authValidators')
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

   const progress1 = await prisma.progress.create({
      data: {
         title: titles.progress.todo,
         titleColor: 'kanban.progress.title.red',
         color: 'kanban.progress.red'
      }
   })

   const progress2 = await prisma.progress.create({
      data: {
         title: titles.progress.inProgress,
         titleColor: 'kanban.progress.title.orange',
         color: 'kanban.progress.orange'
      }
   })

   const progress3 = await prisma.progress.create({
      data: {
         title: titles.progress.done,
         titleColor: 'kanban.progress.title.green',
         color: 'kanban.progress.green'
      }
   })

   return [progress1, progress2, progress3]
}

/**
 * Create default group with localized title
 * @param {string} language - Language code
 * @returns {Promise<Object>} Created group object
 */
const createDefaultGroup = async (language) => {
   const titles = getDefaultTitles(language)

   const group = await prisma.group.create({
      data: {
         title: titles.group
      }
   })

   return group
}

/**
 * Create default task with localized title
 * @param {string} language - Language code
 * @returns {Promise<Object>} Created task object
 */
const createDefaultTask = async (language) => {
   const titles = getDefaultTitles(language)

   const task = await prisma.task.create({
      data: {
         title: titles.task
      }
   })

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

   const page = await prisma.page.create({
      data: {
         userId: user.id,
         title: titles.page,
         progressOrder: progresses.map((p) => p.id),
         groupOrder: [group.id],
         taskMap: [1, 1, 1], // One task across three progress columns
         tasks: [task.id]
      }
   })

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
 * @returns {Object} {token, refreshToken, message} on success
 */
router.post('/', validate(validateRegistration), async (req, res) => {
   // -------------------------------------------------------------------------
   // VALIDATION
   // -------------------------------------------------------------------------
   // Extract data with language defaulting to English
   const { name, email, password, language = 'en' } = req.body

   // Check if user already exists
   let user = await prisma.user.findUnique({ where: { email } })
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

      // Encrypt password
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(password, salt)

      // Create new user
      user = await prisma.user.create({
         data: {
            name,
            email,
            avatar,
            password: hashedPassword
         }
      })

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

      // Generate access token (15 minutes)
      const accessPayload = { user: { id: user.id } }
      const accessToken = jwt.sign(accessPayload, process.env?.JWT_SECRET, {
         expiresIn: 900
      })

      // Generate refresh token (7 days)
      const refreshTokenPayload = {
         user: { id: user.id },
         type: 'refresh',
         tokenId: crypto.randomBytes(16).toString('hex')
      }
      const refreshToken = jwt.sign(
         refreshTokenPayload,
         process.env?.JWT_SECRET,
         { expiresIn: '7d' }
      )

      // Store refresh token in database
      await prisma.user.update({
         where: { id: user.id },
         data: { userRefreshToken: refreshToken }
      })

      res.json({
         token: accessToken,
         refreshToken: refreshToken,
         message: 'User registered successfully with localized content'
      })
   } catch (err) {
      sendErrorResponse(res, 500, 'auth', 'register', err)
   }
})

// =============================================================================
// EXPORT
// =============================================================================

module.exports = router
