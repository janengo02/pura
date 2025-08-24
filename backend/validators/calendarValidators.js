const { body, query, param } = require('express-validator')
const {
   validateEmail,
   validateRequiredString,
   validateOptionalString
} = require('./commonValidators')

/**
 * Calendar and Google Meet validation schemas
 */

// Add Google account validation (for OAuth flow)
const validateAddGoogleAccount = [
   body('code').notEmpty().withMessage('Authorization code is required'),
   body('range').optional().isArray().withMessage('Range must be an array')
]

// List events validation (query parameters)
const validateListEvents = [
   query('minDate')
      .optional()
      .isISO8601()
      .withMessage('Min date must be a valid ISO 8601 date')
      .toDate(),
   query('maxDate')
      .optional()
      .isISO8601()
      .withMessage('Max date must be a valid ISO 8601 date')
      .toDate()
      .custom((maxDate, { req }) => {
         if (req.query.minDate && maxDate <= new Date(req.query.minDate)) {
            throw new Error('Max date must be after min date')
         }
         return true
      }),
   query('pageId')
      .optional()
      .isMongoId()
      .withMessage('Page ID must be a valid ObjectId')
]

// Update default calendar validation (parameter only)
const validateUpdateDefaultCalendar = [
   param('accountEmail')
      .isEmail()
      .withMessage('Account email must be a valid email')
]

// Create event validation
const validateCreateEvent = [
   validateEmail('accountEmail'),
   body('calendarId')
      .notEmpty()
      .isString()
      .withMessage('Calendar ID is required'),
   validateRequiredString('summary', 'Event title', 1, 200),
   validateOptionalString('description', 'Event description', 0, 2000000),
   body('start')
      .notEmpty()
      .withMessage('Start time is required')
      .isISO8601()
      .withMessage('Start time must be a valid ISO 8601 date'),
   body('end')
      .notEmpty()
      .withMessage('End time is required')
      .isISO8601()
      .withMessage('End time must be a valid ISO 8601 date')
      .custom((end, { req }) => {
         if (new Date(end) <= new Date(req.body.start)) {
            throw new Error('End time must be after start time')
         }
         return true
      }),
   body('colorId')
      .optional({ nullable: true })
      .isString()
      .withMessage('Color ID must be a string')
]

// Update event validation
const validateUpdateEvent = [
   param('eventId').notEmpty().withMessage('Event ID is required'),
   validateEmail('accountEmail'),
   body('originalCalendarId')
      .notEmpty()
      .isString()
      .withMessage('Original calendar ID must be a string'),
   body('calendarId')
      .optional()
      .isString()
      .withMessage('Calendar ID must be a string'),
   validateOptionalString('summary', 'Event title', 1, 200),
   validateOptionalString('description', 'Event description', 0, 2000000),
   validateOptionalString('location', 'Location', 0, 500),
   body('start')
      .notEmpty()
      .withMessage('Start time is required')
      .isISO8601()
      .withMessage('Start time must be a valid ISO 8601 date'),
   body('end')
      .notEmpty()
      .withMessage('End time is required')
      .isISO8601()
      .withMessage('End time must be a valid ISO 8601 date')
      .custom((end, { req }) => {
         if (new Date(end) <= new Date(req.body.start)) {
            throw new Error('End time must be after start time')
         }
         return true
      }),
   body('colorId')
      .optional({ nullable: true })
      .isString()
      .withMessage('Color ID must be a string'),
   body('conferenceData')
      .optional({ nullable: true })
      .isObject()
      .withMessage('Conference data must be an object')
]

// Delete event validation
const validateDeleteEvent = [
   param('eventId').notEmpty().withMessage('Event ID is required'),
   validateEmail('accountEmail'),
   body('calendarId')
      .notEmpty()
      .withMessage('Calendar ID is required')
      .isString()
      .withMessage('Calendar ID must be a valid email')
]

// Disconnect account validation
const validateDisconnectAccount = [
   param('accountEmail')
      .isEmail()
      .withMessage('Account email must be a valid email')
]

// Google Meet validations

// Create meeting/space validation
const validateCreateMeeting = [
   validateEmail('accountEmail'),
   body('config').optional().isObject().withMessage('Config must be an object')
]

// Update meeting/space validation
const validateUpdateMeeting = [
   param('spaceId').notEmpty().withMessage('Space ID is required'),
   validateEmail('accountEmail'),
   body('config').optional().isObject().withMessage('Config must be an object')
]

// Delete meeting/space validation
const validateDeleteMeeting = [
   param('spaceId').notEmpty().withMessage('Space ID is required'),
   validateEmail('accountEmail')
]

// Calendar settings validation
const validateCalendarSettings = [
   validateEmail('accountEmail'),
   body('defaultCalendarId')
      .optional()
      .isEmail()
      .withMessage('Default calendar ID must be a valid email'),
   body('syncEnabled')
      .optional()
      .isBoolean()
      .withMessage('Sync enabled must be a boolean')
      .toBoolean(),
   body('syncInterval')
      .optional()
      .isInt({ min: 1, max: 60 })
      .withMessage('Sync interval must be between 1 and 60 minutes')
      .toInt(),
   body('notifications')
      .optional()
      .isObject()
      .withMessage('Notifications must be an object')
]

module.exports = {
   validateAddGoogleAccount,
   validateListEvents,
   validateUpdateDefaultCalendar,
   validateCreateEvent,
   validateUpdateEvent,
   validateDeleteEvent,
   validateDisconnectAccount,
   validateCreateMeeting,
   validateUpdateMeeting,
   validateDeleteMeeting,
   validateCalendarSettings
}
