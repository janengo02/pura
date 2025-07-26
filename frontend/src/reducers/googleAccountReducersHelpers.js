// =============================================================================
// CONSTANTS & UTILITY FUNCTIONS
// =============================================================================

import { SCHEDULE_SYNCE_STATUS } from '@pura/shared'

// Google Calendar event color palette
// These colors match Google Calendar's official color scheme
const GOOGLE_CALENDAR_COLORS = {
   1: '#a4bdfc', // Lavender
   2: '#33b679', // Sage
   3: '#8e24aa', // Grape
   4: '#e67c73', // Flamingo
   5: '#f6bf26', // Banana
   6: '#e3683e', // Tangerine
   7: '#039be5', // Peacock
   8: '#7986cb', // Graphite
   9: '#3f51b5', // Blueberry
   10: '#0b8043', // Basil
   11: '#da5234' // Tomato
}

/**
 * Parse event date/time from Google Calendar API response
 * Handles both dateTime (timed events) and date (all-day events) formats
 * @param {Object} eventTime - Event time object from Google API
 * @returns {Date} Parsed date object
 */
const parseEventDateTime = (eventTime) => {
   if (eventTime?.dateTime) {
      // Timed event with specific time
      return new Date(Date.parse(eventTime.dateTime))
   } else if (eventTime?.date) {
      // All-day event with date only
      const date = new Date(eventTime.date)
      // For all-day events, ensure we're working with local midnight
      date.setHours(0, 0, 0, 0)
      return date
   }
   // Fallback to current date if neither format is available
   return new Date()
}

/**
 * Check if an event is an all-day event
 * Considers both Google Calendar's all-day format (date property) and
 * events that span more than 1 day (which should be treated as all-day for display)
 * @param {Object} event - Google Calendar event object
 * @returns {boolean} True if event is all-day
 */
const isAllDayEvent = (event) => {
   // First check Google Calendar's native all-day format
   if (event.start?.date && event.end?.date) {
      return true
   }

   // Check if event spans more than 1 day
   if (event.start?.dateTime && event.end?.dateTime) {
      const startDate = new Date(event.start.dateTime)
      const endDate = new Date(event.end.dateTime)

      // Calculate the difference in days
      const timeDifferenceMs = endDate.getTime() - startDate.getTime()
      const daysDifference = timeDifferenceMs / (1000 * 60 * 60 * 24)

      // If event spans more than 1 day, treat as all-day
      return daysDifference > 1
   }

   return false
}

/**
 * Check if a task schedule slot is an all-day event
 * Determines if a task schedule spans more than 1 day or covers a full day
 * @param {Date} startTime - Task start time
 * @param {Date} endTime - Task end time
 * @returns {boolean} True if task should be treated as all-day
 */
const isTaskScheduleAllDay = (startTime, endTime) => {
   // Calculate the difference in days
   const timeDifferenceMs = endTime.getTime() - startTime.getTime()
   const daysDifference = timeDifferenceMs / (1000 * 60 * 60 * 24)

   // If task spans more than 1 day, treat as all-day
   if (daysDifference > 1) {
      return true
   }

   // Check if it's a full-day task (starts at beginning of day and ends at end of day)
   const startHour = startTime.getHours()
   const startMinute = startTime.getMinutes()
   const endHour = endTime.getHours()
   const endMinute = endTime.getMinutes()

   // Consider it all-day if it starts early (before 6 AM) and ends late (after 6 PM)
   // and spans at least 8 hours, or if it's exactly midnight to midnight
   const isFullDaySpan =
      (startHour === 0 &&
         startMinute === 0 &&
         endHour === 23 &&
         endMinute >= 59) ||
      (startHour <= 6 && endHour >= 18 && daysDifference >= 0.33) // At least 8 hours spanning morning to evening

   return isFullDaySpan
}

/**
 * Process all-day event end time for react-big-calendar
 * Google Calendar API returns next day for single-day all-day events, but react-big-calendar
 * expects the actual end date. For multi-day events, keep the original end time.
 * @param {Date} startTime - Event start time
 * @param {Date} endTime - End time from Google API
 * @returns {Date} Adjusted end time for react-big-calendar
 */
const processAllDayEndTime = (startTime, endTime) => {
   // Calculate the difference in days
   const timeDifferenceMs = endTime.getTime() - startTime.getTime()
   const daysDifference = timeDifferenceMs / (1000 * 60 * 60 * 24)

   // For multi-day events (more than 1 day), return original end time
   if (daysDifference > 1) {
      return endTime
   }

   // For single-day all-day events, adjust by subtracting one day and setting to end of day
   const adjustedEnd = new Date(endTime)
   adjustedEnd.setDate(adjustedEnd.getDate() - 1)
   adjustedEnd.setHours(23, 59, 59, 999)
   return adjustedEnd
}

/**
 * Extract Google Meet conference data from event
 * @param {Object} event - Google Calendar event object
 * @returns {Object|null} Conference data with Google Meet info
 */
const extractConferenceData = (event) => {
   if (!event.conferenceData) return null

   const conferenceData = event.conferenceData

   // Extract Google Meet specific data
   if (conferenceData.conferenceSolution?.key?.type === 'hangoutsMeet') {
      return {
         type: 'google_meet',
         id: conferenceData.conferenceId,
         joinUrl: conferenceData.entryPoints?.find(
            (ep) => ep.entryPointType === 'video'
         )?.uri,
         phoneNumbers:
            conferenceData.entryPoints
               ?.filter((ep) => ep.entryPointType === 'phone')
               ?.map((ep) => ({
                  number: ep.uri?.replace('tel:', ''),
                  pin: ep.pin,
                  regionCode: ep.regionCode
               })) || [],
         notes: conferenceData.notes,
         signature: conferenceData.signature
      }
   }

   // Handle other conference types (Zoom, Teams, etc.)
   return {
      type: 'other',
      name: conferenceData.conferenceSolution?.name,
      joinUrl: conferenceData.entryPoints?.find(
         (ep) => ep.entryPointType === 'video'
      )?.uri,
      notes: conferenceData.notes
   }
}

/**
 * Extract attendee/guest information from event
 * @param {Object} event - Google Calendar event object
 * @returns {Array} Array of attendee objects
 */
const extractAttendees = (event) => {
   if (!event.attendees) return []

   return event.attendees.map((attendee) => ({
      email: attendee.email,
      displayName: attendee.displayName,
      responseStatus: attendee.responseStatus, // 'accepted', 'declined', 'tentative', 'needsAction'
      isOptional: attendee.optional || false,
      isOrganizer: attendee.organizer || false,
      isSelf: attendee.self || false,
      comment: attendee.comment,
      additionalGuests: attendee.additionalGuests || 0
   }))
}

/**
 * Extract reminder information from event
 * @param {Object} event - Google Calendar event object
 * @returns {Object} Reminder configuration
 */
const extractReminders = (event) => {
   const reminders = event.reminders || {}

   return {
      useDefault: reminders.useDefault || false,
      overrides:
         reminders.overrides?.map((override) => ({
            method: override.method, // 'email', 'popup'
            minutes: override.minutes
         })) || []
   }
}

/**
 * Extract location information with enhanced parsing
 * @param {Object} event - Google Calendar event object
 * @returns {Object|null} Location data
 */
const extractLocation = (event) => {
   if (!event.location) return null

   // Try to parse structured location data if available
   const location = {
      raw: event.location,
      displayName: event.location,
      address: null
   }

   // Check if location contains additional structured data
   if (event.location.includes(',')) {
      const [main, rest] = event.location.split(/,(.+)/)
      location.displayName = main.trim()
      location.address = rest ? rest.trim() : ''
   }

   return location
}

/**
 * Extract extended properties and metadata
 * @param {Object} event - Google Calendar event object
 * @returns {Object} Extended properties
 */
const extractExtendedProperties = (event) => {
   return {
      private: event.extendedProperties?.private || {},
      shared: event.extendedProperties?.shared || {},
      // Check for Pura-specific properties
      isPuraTask: !!event.extendedProperties?.private?.pura_task_id,
      puraTaskId: event.extendedProperties?.private?.pura_task_id || null
   }
}

/**
 * Extract visibility and access information
 * @param {Object} event - Google Calendar event object
 * @returns {Object} Visibility settings
 */
const extractVisibilityInfo = (event) => {
   return {
      visibility: event.visibility || 'default', // 'default', 'public', 'private', 'confidential'
      transparency: event.transparency || 'opaque', // 'opaque', 'transparent'
      status: event.status || 'confirmed', // 'confirmed', 'tentative', 'cancelled'
      locked: event.locked || false,
      privateCopy: event.privateCopy || false
   }
}

/**
 * Extract recurrence information
 * @param {Object} event - Google Calendar event object
 * @returns {Object|null} Recurrence data
 */
const extractRecurrence = (event) => {
   if (!event.recurrence || event.recurrence.length === 0) return null

   return {
      rules: event.recurrence,
      recurringEventId: event.recurringEventId || null,
      originalStartTime: event.originalStartTime
         ? parseEventDateTime(event.originalStartTime)
         : null
   }
}

// =============================================================================
// GOOGLE ACCOUNT STATE TRANSFORMERS
// =============================================================================

/**
 * Transform account for account list helper
 * @param {Array} googleAccounts - Current account list
 * @param {Object} newGoogleAccount - New account data
 * @returns {Array} Updated account list
 */
export const addGoogleAccountListHelper = (
   googleAccounts,
   newGoogleAccount
) => {
   const existingAccountIndex = googleAccounts.findIndex(
      (account) => account.accountEmail === newGoogleAccount.account_email
   )

   const newAccountData = {
      accountEmail: newGoogleAccount.account_email,
      accountSyncStatus: newGoogleAccount.sync_status,
      isDefault: newGoogleAccount.is_default || false
   }

   if (existingAccountIndex !== -1) {
      const updatedAccounts = [...googleAccounts]
      updatedAccounts[existingAccountIndex] = newAccountData
      return updatedAccounts
   } else {
      return [...googleAccounts, newAccountData]
   }
}

/**
 * Add or update calendars for a Google account
 * @param {Array} currentCalendarList - Current calendar list
 * @param {Object} newAccountCalendars - New account calendar data
 * @returns {Array} Updated calendar list
 */
export const addGoogleAccountCalendarListHelper = (
   currentCalendarList,
   newAccountCalendars
) => {
   const calendarsWithoutCurrentAccount = currentCalendarList.filter(
      (c) => c.accountEmail !== newAccountCalendars.account_email
   )

   const newCalendars = newAccountCalendars.calendars.map((calendar) => {
      const currentCalendarSelected = currentCalendarList.find(
         (c) => c.calendarId === calendar.id
      )

      return {
         accountEmail: newAccountCalendars.account_email,
         calendarId: calendar.id,
         title: calendar.summary,
         color: calendar.backgroundColor,
         accessRole: calendar.accessRole,
         isPrimary: calendar.primary || false,
         selected: currentCalendarSelected
            ? currentCalendarSelected.selected
            : calendar.selected || false
      }
   })

   return [...calendarsWithoutCurrentAccount, ...newCalendars]
}

/**
 * Add or update events for a Google account with full date support
 * Note: This function handles only Google Calendar events. Task merging should be done
 * at the application level when tasks data is available.
 * @param {Array} currentCalendarEvents - Current event list
 * @param {Object} newGoogleAccountEvents - New account event data
 * @returns {Array} Updated event list
 */
export const addGoogleAccountEventListHelper = (
   currentCalendarEvents,
   newGoogleAccountEvents
) => {
   // Preserve all events that are not related to the new Google account
   const eventsWithoutCurrentAccount = currentCalendarEvents.filter(
      (ev) => ev.accountEmail !== newGoogleAccountEvents.account_email
   )

   const newEvents = []

   newGoogleAccountEvents.calendars.forEach((calendar) => {
      calendar?.items?.forEach((event) => {
         // Handle both timed events (dateTime) and all-day events (date)
         if (
            (event.start?.dateTime && event.end?.dateTime) ||
            (event.start?.date && event.end?.date)
         ) {
            const startTime = parseEventDateTime(event.start)
            let endTime = parseEventDateTime(event.end)
            const isAllDay = isAllDayEvent(event)

            // Adjust end time for all-day events to work with react-big-calendar
            if (isAllDay) {
               endTime = processAllDayEndTime(startTime, endTime)
            }

            // Look for existing task events that match this Google event ID
            // This includes both 'task' and 'synced' events from ALL accounts, not just the current one
            const existingTaskEvent = currentCalendarEvents.find(
               (ev) =>
                  ev.google_event_id === event.id &&
                  (ev.eventType === 'task' || ev.eventType === 'synced') &&
                  ev.pura_task_id // Ensure it's actually a task-related event
            )

            let syncStatus
            if (existingTaskEvent) {
               // Calculate sync status by comparing times between task and Google event
               const taskStart = new Date(existingTaskEvent.start).toISOString()
               const taskEnd = new Date(existingTaskEvent.end).toISOString()
               const googleStart = startTime.toISOString()
               const googleEnd = endTime.toISOString()

               if (taskStart === googleStart && taskEnd === googleEnd) {
                  syncStatus = SCHEDULE_SYNCE_STATUS.SYNCED
               } else {
                  syncStatus = SCHEDULE_SYNCE_STATUS.CONFLICTED
               }
            }

            const syncedInfo = existingTaskEvent
               ? {
                    pura_task_id: existingTaskEvent.pura_task_id,
                    pura_schedule_index: existingTaskEvent.pura_schedule_index,
                    eventType: 'synced',
                    title: existingTaskEvent.title, // Use task title for synced events
                    syncStatus: syncStatus // Calculate sync status from time comparison
                 }
               : {
                    eventType: 'google',
                    title: event.summary || 'Untitled Event'
                 }

            newEvents.push({
               id: event.id,
               google_event_id: event.id,
               start: startTime,
               end: endTime,
               allDay: isAllDay, // Critical property for react-big-calendar
               calendarId: calendar.id,
               calendar: calendar.summary,
               accessRole: calendar.accessRole,
               calendarVisible: calendar.selected || false,
               accountEmail: newGoogleAccountEvents.account_email,
               googleEventTitle: event.summary || 'Untitled Event',
               color: event.colorId
                  ? GOOGLE_CALENDAR_COLORS[event.colorId] ||
                    calendar.backgroundColor
                  : calendar.backgroundColor, // Use event color if available, fallback to calendar color
               ...syncedInfo
            })
         }
      })
   })

   return [...eventsWithoutCurrentAccount, ...newEvents]
}

/**
 * Main function to add Google account data to state
 * @param {Object} params - State and new account data
 * @returns {Object} Updated state with new account data
 */
export const addGoogleAccount = ({
   googleAccounts,
   googleCalendars,
   googleEvents,
   newGoogleAccount
}) => {
   console.log('Adding Google account========================')
   console.log('Old googleAccounts:', googleAccounts)
   console.log('Old googleCalendars:', googleCalendars)
   console.log('Old googleEvents:', googleEvents)
   console.log('New account data-------', newGoogleAccount)

   const updatedAccounts = addGoogleAccountListHelper(
      googleAccounts,
      newGoogleAccount
   )
   const updatedCalendars = addGoogleAccountCalendarListHelper(
      googleCalendars,
      newGoogleAccount
   )
   const newAccountEvents = addGoogleAccountEventListHelper(
      googleEvents,
      newGoogleAccount
   )
   const defaultAccount =
      updatedAccounts.find((account) => account.isDefault) || null
   console.log('New googleAccounts:', updatedAccounts)
   console.log('New googleCalendars:', updatedCalendars)
   console.log('New googleEvents:', newAccountEvents)

   return {
      googleAccounts: updatedAccounts,
      googleCalendars: updatedCalendars,
      googleEvents: newAccountEvents,
      defaultAccount
   }
}
// =============================================================================
// DEFAULT ACCOUNT STATE TRANSFORMERS
// =============================================================================

/**
 * Set default Google account in state
 * @param {Object} params - State and account data
 * @param {Array} params.googleAccounts - Current accounts list
 * @param {String} params.accountEmail - ID of account to set as default
 * @param {Object} params.accountData - Updated account data
 * @returns {Object} Updated state
 */
export const setDefaultGoogleAccount = ({
   googleAccounts,
   accountEmail,
   accountData
}) => {
   const updatedAccounts = googleAccounts.map((account) => ({
      ...account,
      isDefault: account.accountEmail === accountEmail
   }))

   return {
      googleAccounts: updatedAccounts,
      defaultAccount: {
         accountEmail: accountData.account_email,
         accountSyncStatus: accountData.sync_status,
         isDefault: true
      }
   }
}

/**
 * Get default Google account in state
 * @param {Object} params - Default account data
 * @param {Object} params.defaultAccountData - Default account data from API
 * @returns {Object} Updated state
 */
export const getDefaultGoogleAccount = ({ defaultAccountData }) => {
   return {
      defaultAccount: defaultAccountData
         ? {
              accountEmail: defaultAccountData.account_email,
              accountSyncStatus: defaultAccountData.sync_status,
              isDefault: true
           }
         : null
   }
}

// =============================================================================
// GOOGLE CALENDAR LOADING STATE TRANSFORMERS
// =============================================================================
/**
 * Transform accounts for loading state
 * @param {Array} googleAccounts - Raw Google accounts data
 * @returns {Array} Transformed account list
 */
export const loadAccountListHelper = (googleAccounts) => {
   return googleAccounts.map((account) => ({
      accountEmail: account.account_email,
      accountSyncStatus: account.sync_status,
      isDefault: account.is_default || false
   }))
}

/**
 * Transform Google calendars for loading state
 * @param {Array} googleAccounts - Raw Google accounts data
 * @returns {Array} Transformed calendar list
 */
export const loadCalendarListHelper = (googleAccounts) => {
   const calendars = []

   googleAccounts.forEach((account) => {
      account.calendars.forEach((calendar) => {
         calendars.push({
            accountEmail: account.account_email,
            calendarId: calendar.id,
            title: calendar.summary,
            color: calendar.backgroundColor,
            accessRole: calendar.accessRole,
            isPrimary: calendar.primary || false,
            selected: calendar.selected || false
         })
      })
   })

   return calendars
}

/**
 * Enhanced event data extraction with comprehensive Google Calendar data
 * @param {Object} event - Raw Google Calendar event object
 * @param {Object} calendar - Calendar object
 * @param {Object} account - Account object
 * @param {Object} syncedTaskInfo - Task sync information (optional)
 * @returns {Object} Enhanced event object
 */
const createEnhancedEventObject = (
   event,
   calendar,
   account,
   syncedTaskInfo = null
) => {
   const startTime = parseEventDateTime(event.start)
   let endTime = parseEventDateTime(event.end)
   const isAllDay = isAllDayEvent(event)

   // Adjust end time for all-day events
   if (isAllDay) {
      endTime = processAllDayEndTime(startTime, endTime)
   }

   // Base event object
   const baseEvent = {
      id: event.id,
      google_event_id: event.id,
      title: event.summary || 'Untitled Event',
      start: startTime,
      end: endTime,
      allDay: isAllDay,
      calendarId: calendar.id,
      calendar: calendar.summary,
      color: event.colorId
         ? GOOGLE_CALENDAR_COLORS[event.colorId] || calendar.backgroundColor
         : calendar.backgroundColor,
      accessRole: calendar.accessRole,
      calendarVisible: calendar.selected || false,
      accountEmail: account.account_email,

      // Enhanced data extraction
      description: event.description || null,
      location: extractLocation(event),
      attendees: extractAttendees(event),
      conferenceData: extractConferenceData(event),
      reminders: extractReminders(event),
      visibility: extractVisibilityInfo(event),
      extendedProperties: extractExtendedProperties(event),
      recurrence: extractRecurrence(event),

      // Event metadata
      createdDate: event.created ? new Date(event.created) : null,
      updatedDate: event.updated ? new Date(event.updated) : null,
      creator: {
         email: event.creator?.email || null,
         displayName: event.creator?.displayName || null,
         self: event.creator?.self || false
      },
      organizer: {
         email: event.organizer?.email || null,
         displayName: event.organizer?.displayName || null,
         self: event.organizer?.self || false
      },

      // Event URLs and links
      htmlLink: event.htmlLink || null,
      hangoutLink: event.hangoutLink || null, // Legacy Google Meet link

      // Guest management
      guestsCanInviteOthers: event.guestsCanInviteOthers !== false,
      guestsCanModify: event.guestsCanModify || false,
      guestsCanSeeOtherGuests: event.guestsCanSeeOtherGuests !== false,

      // Additional metadata
      etag: event.etag || null,
      sequence: event.sequence || 0,
      source: event.source || null
   }

   // Handle synced task events
   if (syncedTaskInfo) {
      // Calculate sync status
      const taskStart = new Date(syncedTaskInfo.slot.start).toISOString()
      const taskEnd = new Date(syncedTaskInfo.slot.end).toISOString()
      const googleStart = startTime.toISOString()
      const googleEnd = endTime.toISOString()

      const syncStatus =
         taskStart === googleStart && taskEnd === googleEnd
            ? SCHEDULE_SYNCE_STATUS.SYNCED
            : SCHEDULE_SYNCE_STATUS.CONFLICTED

      return {
         ...baseEvent,
         title: syncedTaskInfo.taskTitle, // Use task title for synced events
         description: syncedTaskInfo.taskContent,
         eventType: 'synced',
         syncStatus: syncStatus,
         pura_task_id: syncedTaskInfo.taskId,
         pura_schedule_index: syncedTaskInfo.slotIndex,
         googleEventTitle: event.summary || 'Untitled Event' // Keep original Google event title
      }
   }

   // Regular Google Calendar event
   return {
      ...baseEvent,
      eventType: 'google'
   }
}
/**
 * Transform events from Google accounts and tasks with full date support
 * Merges synced task schedule slots with Google events to avoid duplication
 * @param {Array} googleAccounts - Raw Google accounts data
 * @param {Array} tasks - Task schedule data
 * @returns {Array} Transformed event list with merged synced events
 */
export const loadEventListHelper = (googleAccounts, tasks) => {
   const events = []

   // Create a set of all existing Google event IDs
   const existingGoogleEventIds = new Set()
   googleAccounts.forEach((account) => {
      account.calendars.forEach((calendar) => {
         calendar?.items?.forEach((event) => {
            existingGoogleEventIds.add(event.id)
         })
      })
   })

   // Create a map of synced Google events to task information
   const syncedEventMap = new Map()
   tasks.forEach((task) => {
      task.schedule?.forEach((slot, slotIndex) => {
         if (
            slot.google_event_id &&
            existingGoogleEventIds.has(slot.google_event_id)
         ) {
            syncedEventMap.set(slot.google_event_id, {
               taskId: task._id,
               taskTitle: task.title,
               taskContent: task.content,
               slotIndex,
               slot
            })
         }
      })
   })

   // Add task schedule events that are NOT synced with existing Google Calendar events
   tasks.forEach((task) => {
      task.schedule?.forEach((slot, slotIndex) => {
         if (
            !slot.google_event_id ||
            !existingGoogleEventIds.has(slot.google_event_id)
         ) {
            const startTime = new Date(Date.parse(slot.start))
            const endTime = new Date(Date.parse(slot.end))
            const isAllDay = isTaskScheduleAllDay(startTime, endTime)

            events.push({
               id: `${task._id}_${slotIndex}`,
               google_event_id: slot.google_event_id || null,
               pura_task_id: task._id,
               pura_schedule_index: slotIndex,
               title: task.title,
               start: startTime,
               end: endTime,
               allDay: isAllDay,
               calendarId: slot.google_calendar_id || null,
               calendar: null,
               color: '#d2c2f2',
               accessRole: 'owner',
               calendarVisible: true,
               accountEmail: slot.google_account_email || null,
               eventType: 'task',
               googleEventTitle: null,

               // Initialize enhanced fields for task events
               description: task.content,
               location: null,
               attendees: [],
               conferenceData: null,
               reminders: { useDefaultNullifier: false, overrides: [] },
               visibility: {
                  visibility: 'default',
                  transparency: 'opaque',
                  status: 'confirmed'
               },
               extendedProperties: {
                  private: {},
                  shared: {},
                  isPuraTask: true,
                  puraTaskId: task._id
               },
               recurrence: null
            })
         }
      })
   })

   // Add Google Calendar events with enhanced data extraction
   googleAccounts.forEach((account) => {
      account.calendars.forEach((calendar) => {
         calendar?.items?.forEach((event) => {
            // Handle both timed events and all-day events
            if (
               (event.start?.dateTime && event.end?.dateTime) ||
               (event.start?.date && event.end?.date)
            ) {
               const syncedTaskInfo = syncedEventMap.get(event.id)
               const enhancedEvent = createEnhancedEventObject(
                  event,
                  calendar,
                  account,
                  syncedTaskInfo
               )
               events.push(enhancedEvent)
            }
         })
      })
   })

   return events
}
/**
 * Main function to load Google calendar data to state
 * @param {Object} params - State and API data
 * @param {Array} params.googleAccounts - Raw Google accounts data
 * @param {Array} params.tasks - Task data
 * @returns {Object} Updated state with calendar data
 */
export const loadGoogleCalendar = ({ googleAccounts, tasks }) => {
   const accounts = loadAccountListHelper(googleAccounts)
   const calendars = loadCalendarListHelper(googleAccounts)
   const events = loadEventListHelper(googleAccounts, tasks)
   const defaultAccount = accounts.find((account) => account.isDefault) || null

   return {
      googleAccounts: accounts,
      googleCalendars: calendars,
      googleEvents: events,
      defaultAccount
   }
}

// =============================================================================
// CALENDAR VISIBILITY STATE TRANSFORMERS
// =============================================================================

/**
 * Toggle calendar visibility in calendar list
 * @param {Array} currentCalendarList - Current calendar list
 * @param {string} calendarId - Calendar ID to toggle
 * @returns {Array} Updated calendar list
 */
export const changeVisibilityCalendarListHelper = (
   currentCalendarList,
   calendarId
) => {
   return currentCalendarList.map((calendar) =>
      calendar.calendarId === calendarId
         ? { ...calendar, selected: !calendar.selected }
         : calendar
   )
}

/**
 * Toggle event visibility based on calendar visibility
 * @param {Array} currentEventList - Current event list
 * @param {string} calendarId - Calendar ID to toggle
 * @returns {Array} Updated event list
 */
export const changeVisibilityEventListHelper = (
   currentEventList,
   calendarId
) => {
   return currentEventList.map((event) =>
      event.calendarId === calendarId
         ? { ...event, calendarVisible: !event.calendarVisible }
         : event
   )
}

/**
 * Main function to change Google calendar visibility
 * @param {Object} params - Calendar and event lists with target calendar ID
 * @returns {Object} Updated state with toggled visibility
 */
export const changeGoogleCalendarVisibility = ({
   googleCalendars,
   googleEvents,
   calendarId
}) => {
   return {
      googleCalendars: changeVisibilityCalendarListHelper(
         googleCalendars,
         calendarId
      ),
      googleEvents: changeVisibilityEventListHelper(googleEvents, calendarId)
   }
}

// =============================================================================
// EVENT UPDATE STATE TRANSFORMERS
// =============================================================================

/**
 * Update or delete Google event with full date support
 * @param {Object} params - Event list and updated event data
 * @returns {Object} Updated state with modified event
 */
export const updateGoogleEvent = ({ googleEvents, updatedEvent }) => {
   // Handle event deletion
   if (updatedEvent.deleted) {
      return {
         googleEvents: googleEvents.filter((ev) => ev.id !== updatedEvent.id)
      }
   }

   // Update existing event with enhanced data
   const updatedEventList = googleEvents.map((event) => {
      if (event.id === updatedEvent.id) {
         const startTime = parseEventDateTime(updatedEvent.start)
         let endTime = parseEventDateTime(updatedEvent.end)
         const isAllDay = isAllDayEvent(updatedEvent)

         if (isAllDay) {
            endTime = processAllDayEndTime(startTime, endTime)
         }

         return {
            ...event,
            title: updatedEvent.summary || event.title,
            start: startTime,
            end: endTime,
            allDay: isAllDay,
            description: updatedEvent.description || event.description,
            location: extractLocation(updatedEvent) || event.location,
            attendees: extractAttendees(updatedEvent),
            conferenceData:
               extractConferenceData(updatedEvent) || event.conferenceData,
            reminders: extractReminders(updatedEvent),
            visibility: extractVisibilityInfo(updatedEvent),
            extendedProperties: extractExtendedProperties(updatedEvent),
            recurrence: extractRecurrence(updatedEvent) || event.recurrence,
            updatedDate: updatedEvent.updated
               ? new Date(updatedEvent.updated)
               : new Date()
         }
      }
      return event
   })

   return { googleEvents: updatedEventList }
}

// =============================================================================
// EVENT CREATION STATE TRANSFORMERS
// =============================================================================

/**
 * Create new Google event with full date support
 * @param {Object} params - Calendar list, event list, account ID, and new event data
 * @returns {Object} Updated state with new event
 */
export const createGoogleEvent = ({
   googleCalendars,
   googleEvents,
   accountEmail,
   newEvent
}) => {
   // Find the primary calendar for the given accountEmail
   const calendar = googleCalendars.find(
      (cal) => cal.accountEmail === accountEmail && cal.isPrimary
   )

   if (!calendar) {
      // If no primary calendar found, return current events unchanged
      return { googleEvents }
   }

   const startTime = parseEventDateTime(newEvent.start)
   let endTime = parseEventDateTime(newEvent.end)
   const isAllDay = isAllDayEvent(newEvent)

   // Adjust end time for all-day events to work with react-big-calendar
   if (isAllDay) {
      endTime = processAllDayEndTime(startTime, endTime)
   }

   const eventToAdd = {
      id: newEvent.id,
      title: newEvent.summary || 'New Event',
      start: startTime,
      end: endTime,
      allDay: isAllDay, // Critical property for react-big-calendar
      calendarId: calendar.calendarId,
      calendar: calendar.title,
      color: calendar.color,
      accessRole: calendar.accessRole,
      calendarVisible: calendar.selected || false,
      accountEmail: accountEmail
   }

   return { googleEvents: [...googleEvents, eventToAdd] }
}
// =============================================================================
// REMOVE ACCOUNT STATE TRANSFORMERS
// =============================================================================
export const removeGoogleAccount = ({
   googleAccounts,
   googleCalendars,
   googleEvents,
   removedAccountEmail
}) => {
   // Remove the account from the list
   const updatedAccounts = googleAccounts.filter(
      (account) => account.accountEmail !== removedAccountEmail
   )

   // Remove all calendars associated with the removed account
   const updatedCalendars = googleCalendars.filter(
      (calendar) => calendar.accountEmail !== removedAccountEmail
   )

   // Filter and transform events associated with the removed account
   const updatedEvents = googleEvents
      .filter((event) => {
         // Remove events with eventType "google" from the removed account
         if (
            event.accountEmail === removedAccountEmail &&
            event.eventType === 'google'
         ) {
            return false
         }
         return true
      })
      .map((event) => {
         // Convert events with eventType "synced" from the removed account to "task"
         if (
            event.accountEmail === removedAccountEmail &&
            event.eventType === 'synced'
         ) {
            return {
               ...event,
               eventType: 'task',
               color: '#d2c2f2', // Default task color
               accessRole: 'owner',
               calendarVisible: true
               // Keep Google events info for future sync detection
            }
         }
         return event
      })

   console.log('Removed Google account=============================')
   console.log('Updated Google accounts:', updatedAccounts)
   console.log('Updated Google calendars:', updatedCalendars)
   console.log('Updated Google events:', updatedEvents)
   return {
      googleAccounts: updatedAccounts,
      googleCalendars: updatedCalendars,
      googleEvents: updatedEvents,
      defaultAccount:
         updatedAccounts.find((account) => account.isDefault) || null
   }
}
