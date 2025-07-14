// =============================================================================
// CONSTANTS & UTILITY FUNCTIONS
// =============================================================================

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
      (account) => account.accountId === newGoogleAccount._id
   )

   const newAccountData = {
      accountId: newGoogleAccount._id,
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
      (c) => c.accountId !== newAccountCalendars._id
   )

   const newCalendars = newAccountCalendars.calendars.map((calendar) => {
      const currentCalendarSelected = currentCalendarList.find(
         (c) => c.calendarId === calendar.id
      )

      return {
         accountId: newAccountCalendars._id,
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
   const eventsWithoutCurrentAccount = currentCalendarEvents.filter(
      (ev) => ev.accountId !== newGoogleAccountEvents._id
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

            // Note: We preserve existing synced event information if it exists
            const existingEvent = currentCalendarEvents.find(
               (ev) => ev.google_event_id === event.id
            )
            const syncedInfo =
               existingEvent &&
               (existingEvent.eventType === 'synced' ||
                  existingEvent.eventType === 'task')
                  ? {
                       pura_task_id: existingEvent.pura_task_id,
                       pura_schedule_index: existingEvent.pura_schedule_index,
                       eventType: 'synced'
                    }
                  : {
                       eventType: 'google'
                    }

            newEvents.push({
               id: event.id,
               google_event_id: event.id,
               title: event.summary || 'Untitled Event',
               start: startTime,
               end: endTime,
               allDay: isAllDay, // Critical property for react-big-calendar
               calendarId: calendar.id,
               calendar: calendar.summary,
               color: calendar.backgroundColor,
               accessRole: calendar.accessRole,
               calendarVisible: calendar.selected || false,
               accountId: newGoogleAccountEvents._id,
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
   const updatedAccounts = addGoogleAccountListHelper(
      googleAccounts,
      newGoogleAccount
   )
   const defaultAccount =
      updatedAccounts.find((account) => account.isDefault) || null

   return {
      googleAccounts: updatedAccounts,
      googleCalendars: addGoogleAccountCalendarListHelper(
         googleCalendars,
         newGoogleAccount
      ),
      googleEvents: addGoogleAccountEventListHelper(
         googleEvents,
         newGoogleAccount
      ),
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
 * @param {String} params.accountId - ID of account to set as default
 * @param {Object} params.accountData - Updated account data
 * @returns {Object} Updated state
 */
export const setDefaultGoogleAccount = ({
   googleAccounts,
   accountId,
   accountData
}) => {
   const updatedAccounts = googleAccounts.map((account) => ({
      ...account,
      isDefault: account.accountId === accountId
   }))

   return {
      googleAccounts: updatedAccounts,
      defaultAccount: {
         accountId: accountData._id,
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
              accountId: defaultAccountData._id,
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
      accountId: account._id,
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
            accountId: account._id,
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
   // Only include task slots that have matching Google events
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
               slotIndex,
               slot
            })
         }
      })
   })

   // Add task schedule events that are NOT synced with existing Google Calendar events
   tasks.forEach((task) => {
      task.schedule?.forEach((slot, slotIndex) => {
         // Add task events if:
         // 1. No google_event_id (never been synced), OR
         // 2. Has google_event_id but no matching Google event exists (orphaned sync)
         if (
            !slot.google_event_id ||
            !existingGoogleEventIds.has(slot.google_event_id)
         ) {
            const startTime = new Date(Date.parse(slot.start))
            const endTime = new Date(Date.parse(slot.end))
            const isAllDay = isTaskScheduleAllDay(startTime, endTime)

            events.push({
               id: `${task._id}_${slotIndex}`, // Unique ID for unsynced task events
               pura_task_id: task._id,
               pura_schedule_index: slotIndex,
               title: task.title,
               start: startTime,
               end: endTime,
               allDay: isAllDay,
               calendarId: null,
               calendar: null,
               color: '#d2c2f2',
               accessRole: 'owner',
               calendarVisible: true,
               accountId: null,
               eventType: 'task' // Identify as task event
            })
         }
      })
   })

   // Add Google Calendar events (with merged task information for synced events)
   googleAccounts.forEach((account) => {
      account.calendars.forEach((calendar) => {
         calendar?.items?.forEach((event) => {
            // Handle both timed events and all-day events
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

               // Check if this Google event is synced with a task
               const syncedTaskInfo = syncedEventMap.get(event.id)

               if (syncedTaskInfo) {
                  // This is a synced event - merge task and Google event information
                  events.push({
                     id: event.id,
                     google_event_id: event.id,
                     pura_task_id: syncedTaskInfo.taskId,
                     pura_schedule_index: syncedTaskInfo.slotIndex,
                     title: syncedTaskInfo.taskTitle, // Use task title for synced events
                     start: startTime,
                     end: endTime,
                     allDay: isAllDay,
                     calendarId: calendar.id,
                     calendar: calendar.summary,
                     color: '#8B5CF6', // Purple color to indicate synced event
                     accessRole: calendar.accessRole,
                     calendarVisible: calendar.selected || false,
                     accountId: account._id,
                     eventType: 'synced', // Identify as synced event
                     // Keep Google event details for reference
                     googleEventTitle: event.summary || 'Untitled Event'
                  })
               } else {
                  // This is a regular Google Calendar event (not synced with any task)
                  events.push({
                     id: event.id,
                     google_event_id: event.id,
                     title: event.summary || 'Untitled Event',
                     start: startTime,
                     end: endTime,
                     allDay: isAllDay,
                     calendarId: calendar.id,
                     calendar: calendar.summary,
                     color: calendar.backgroundColor,
                     accessRole: calendar.accessRole,
                     calendarVisible: calendar.selected || false,
                     accountId: account._id,
                     eventType: 'google' // Identify as Google event
                  })
               }
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

   // Update existing event
   const updatedEventList = googleEvents.map((event) => {
      if (event.id === updatedEvent.id) {
         const startTime = parseEventDateTime(updatedEvent.start)
         let endTime = parseEventDateTime(updatedEvent.end)
         const isAllDay = isAllDayEvent(updatedEvent)

         // Adjust end time for all-day events to work with react-big-calendar
         if (isAllDay) {
            endTime = processAllDayEndTime(startTime, endTime)
         }

         return {
            ...event,
            title: updatedEvent.summary || event.title,
            start: startTime,
            end: endTime,
            allDay: isAllDay // Critical property for react-big-calendar
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
   accountId,
   newEvent
}) => {
   // Find the primary calendar for the given accountId
   const calendar = googleCalendars.find(
      (cal) => cal.accountId === accountId && cal.isPrimary
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
      accountId: accountId
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
   removedAccountId
}) => {
   // Remove the account from the list
   const updatedAccounts = googleAccounts.filter(
      (account) => account.accountId !== removedAccountId
   )

   // Remove all calendars associated with the removed account
   const updatedCalendars = googleCalendars.filter(
      (calendar) => calendar.accountId !== removedAccountId
   )

   // Filter and transform events associated with the removed account
   const updatedEvents = googleEvents
      .filter((event) => {
         // Remove events with eventType "google" from the removed account
         if (event.accountId === removedAccountId && event.eventType === 'google') {
            return false
         }
         return true
      })
      .map((event) => {
         // Convert events with eventType "synced" from the removed account to "task"
         if (event.accountId === removedAccountId && event.eventType === 'synced') {
            return {
               ...event,
               eventType: 'task',
               // Remove Google Calendar related values
               google_event_id: undefined,
               calendarId: null,
               calendar: null,
               color: '#d2c2f2', // Default task color
               accessRole: 'owner',
               calendarVisible: true,
               accountId: null,
               googleEventTitle: undefined
            }
         }
         return event
      })

   return {
      googleAccounts: updatedAccounts,
      googleCalendars: updatedCalendars,
      googleEvents: updatedEvents,
      defaultAccount:
         updatedAccounts.find((account) => account.isDefault) || null
   }
}
