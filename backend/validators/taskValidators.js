const { body } = require('express-validator')
const {
   validateObjectId,
   validateOptionalString,
   validateNumericParam,
   validateSchedule
} = require('./commonValidators')

/**
 * Task validation schemas
 */

// Validate task ID and page ID parameters
const validateTaskParams = [
   validateObjectId('pageId', 'Page ID'),
   validateObjectId('taskId', 'Task ID')
]

// Validate page ID parameter only
const validatePageParam = [validateObjectId('pageId', 'Page ID')]

// Validate slot index parameter
const validateSlotParams = [
   validateObjectId('pageId', 'Page ID'),
   validateObjectId('taskId', 'Task ID'),
   validateNumericParam('slotIndex', 'Slot index', 0)
]

// Create new task validation
const validateCreateTask = [
   validateObjectId('pageId', 'Page ID'),
   body('groupId')
      .notEmpty()
      .withMessage('Group ID is required')
      .isMongoId()
      .withMessage('Group ID must be a valid ObjectId'),
   body('progressId')
      .notEmpty()
      .withMessage('Progress ID is required')
      .isMongoId()
      .withMessage('Progress ID must be a valid ObjectId'),
   validateOptionalString('title', 'Title', 1, 200),
   validateOptionalString('content', 'Content', 0, 2000),
   validateSchedule('schedule')
]

// Update task basic info validation
const validateUpdateTaskBasic = [
   ...validateTaskParams,
   validateOptionalString('title', 'Title', 1, 200),
   validateOptionalString('content', 'Content', 0, 2000)
]

// Move task validation
const validateMoveTask = [
   ...validateTaskParams,
   body('groupId')
      .optional({ nullable: true })
      .isMongoId()
      .withMessage('Group ID must be a valid ObjectId'),
   body('progressId')
      .optional({ nullable: true })
      .isMongoId()
      .withMessage('Progress ID must be a valid ObjectId')
]

// Update task schedule validation
const validateUpdateTaskSchedule = [
   ...validateSlotParams,
   body('start')
      .optional({ nullable: true })
      .isISO8601({ strict: true })
      .withMessage('Start time must be a valid ISO 8601 date')
      .toDate(),
   body('end')
      .optional({ nullable: true })
      .isISO8601({ strict: true })
      .withMessage('End time must be a valid ISO 8601 date')
      .toDate()
      .custom((end, { req }) => {
         const start = new Date(req.body.start)
         if (end <= start) {
            throw new Error('End time must be after start time')
         }
         return true
      })
]

// Add task schedule slot validation
const validateAddTaskScheduleSlot = [
   ...validateTaskParams,
   body('start')
      .notEmpty()
      .withMessage('Start time is required')
      .isISO8601({ strict: true })
      .withMessage('Start time must be a valid ISO 8601 date')
      .toDate(),
   body('end')
      .notEmpty()
      .withMessage('End time is required')
      .isISO8601({ strict: true })
      .withMessage('End time must be a valid ISO 8601 date')
      .toDate()
      .custom((end, { req }) => {
         const start = new Date(req.body.start)
         if (end <= start) {
            throw new Error('End time must be after start time')
         }
         return true
      })
]

// Sync Google event validation
const validateSyncGoogleEvent = [
   body('taskId')
      .notEmpty()
      .withMessage('Task ID is required')
      .isMongoId()
      .withMessage('Task ID must be a valid ObjectId'),
   body('slotIndex')
      .isInt({ min: 0 })
      .withMessage('Slot index must be a non-negative integer')
      .toInt(),
   body('accountEmail')
      .notEmpty()
      .withMessage('Account email is required')
      .isEmail()
      .withMessage('Account email must be a valid email'),

   body('calendarId')
      .notEmpty()
      .withMessage('Calendar ID is required')
      .isString()
      .withMessage('Calendar ID must be a valid email'),

   body('syncAction')
      .notEmpty()
      .withMessage('Sync action is required')
      .isString()
      .withMessage('Sync action must be a string')
      .isIn(['create', 'update', 'delete'])
      .withMessage('Sync action must be one of: create, update, delete')
]

module.exports = {
   validateTaskParams,
   validatePageParam,
   validateSlotParams,
   validateCreateTask,
   validateUpdateTaskBasic,
   validateMoveTask,
   validateUpdateTaskSchedule,
   validateAddTaskScheduleSlot,
   validateSyncGoogleEvent
}
