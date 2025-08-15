// =============================================================================
// IMPORTS
// =============================================================================

import { api } from '../utils'
import { setAlertAction } from './alertActions'
import { commonErrorHandler, fatalErrorHandler } from './errorActions'
import {
   GET_CALENDAR,
   UPDATE_CALENDAR_VISIBILITY,
   UPDATE_CALENDAR_EVENT,
   UPDATE_CALENDAR_EVENT_TIME,
   ADD_CALENDAR_ACCOUNT,
   REMOVE_CALENDAR_ACCOUNT,
   SET_CALENDAR_DEFAULT_ACCOUNT,
   GET_CALENDAR_DEFAULT_ACCOUNT,
   DELETE_CALENDAR_EVENT,
   UPDATE_TASK_SCHEDULE,
   CREATE_CALENDAR_EVENT,
   CLEAR_CALENDAR_EVENT
} from './types'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// =============================================================================
// ACTION CREATORS
// =============================================================================
/**
 * Change calendar date range
 * @param {Array} range - Date range [startDate, endDate]
 * @returns {Object} Redux action
 */
export const changeCalendarRangeAction = (range) => ({
   type: 'UPDATE_CALENDAR_RANGE',
   payload: { range }
})

/**
 * Navigate calendar to specific date and view
 * @param {Date} date - Target date to navigate to
 * @param {string} view - View type (month, week, day)
 * @param {string} taskId - Optional task ID for event highlighting
 * @param {number} slotIndex - Optional slot index for event highlighting
 * @returns {Object} Redux action
 */
export const navigateCalendarToDateAction = (
   date,
   taskId = null,
   slotIndex = null
) => ({
   type: 'NAVIGATE_CALENDAR_TO_DATE',
   payload: { date, taskId, slotIndex }
})
/**
 * Load Calendar Action
 * Loads Google Calendar events for the specified date range
 * @param {Array} visibleRange - Array containing start and end dates
 * @param {string} pageId - ID of the page for context
 */
export const loadCalendarAction =
   (visibleRange, pageId) => async (dispatch) => {
      try {
         const res = await api.get('/calendar/list-events', {
            params: {
               minDate: visibleRange[0],
               maxDate: visibleRange[1],
               pageId
            }
         })

         dispatch({
            type: GET_CALENDAR,
            payload: {
               data: res.data.google_accounts,
               tasks: res.data.tasks || []
            }
         })
      } catch (err) {
         fatalErrorHandler(dispatch, pageId, err)
      }
   }

/**
 * Add Google Account Action
 * Adds a new Google account connection
 * @param {Object} reqData - Request data for adding account
 * @param {string} reqData.code - OAuth authorization code
 * @param {Array} reqData.range - Date range for initial sync
 */
export const addGoogleAccountAction =
   (reqData) => async (dispatch, getState) => {
      try {
         const res = await api.post('/calendar/add-account', reqData)

         if (res.data?.account_email) {
            dispatch({
               type: ADD_CALENDAR_ACCOUNT,
               payload: {
                  data: res.data,
                  range: reqData.range
               }
            })
         } else {
            throw new Error(
               'Unexpected response format from /calendar/add-account'
            )
         }
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Set Default Google Account Action
 * Sets a specific Google account as the default account
 * @param {Object} reqData - Request data for setting default account
 * @param {string} reqData.account_email - ID of the account to set as default
 */
export const setDefaultGoogleAccountAction =
   (reqData) => async (dispatch, getState) => {
      try {
         const res = await api.put(
            `/calendar/set-default/${reqData.account_email}`
         )

         if (res.data?._id) {
            dispatch({
               type: SET_CALENDAR_DEFAULT_ACCOUNT,
               payload: {
                  accountEmail: reqData.account_email,
                  accountData: res.data
               }
            })
         } else {
            throw new Error(
               'Unexpected response format from /calendar/set-default'
            )
         }
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Get Default Google Account Action
 * Retrieves the current default Google account
 */
export const getDefaultGoogleAccountAction =
   () => async (dispatch, getState) => {
      try {
         const res = await api.get('/calendar/default')

         dispatch({
            type: GET_CALENDAR_DEFAULT_ACCOUNT,
            payload: res.data?._id ? res.data : null
         })
      } catch (err) {
         // Only show error if it's not a 404 (no default account)
         if (err.response?.status !== 404) {
            commonErrorHandler(dispatch, err, getState)
         }
      }
   }

/**
 * Update Google Event Action
 * Updates an existing event in Google Calendar
 * @param {Object} reqData - Request data for event update
 * @param {string} reqData.eventId - Event ID to update
 * @param {string} reqData.accountEmail - Google account ID
 * @param {string} reqData.calendarId - Target calendar ID (for moves)
 * @param {string} reqData.originalCalendarId - Original calendar ID
 * @param {string} reqData.calendarSummary - Target calendar summary/name for optimistic updates
 * @param {string} reqData.calendarBackgroundColor - Target calendar background color for optimistic updates
 * @param {string} [reqData.task_id] - Task ID for synced events
 * @param {number} [reqData.slot_index] - Slot index for synced events
 * @param {number} [reqData.target_event_index] - Target event index for task detail updates
 */
export const updateGoogleEventAction =
   (reqData) => async (dispatch, getState) => {
      try {
         // Optimistic update - Calendar - update event in state
         // Create optimistic update payload
         const optimisticEventData = {
            id: reqData.eventId,
            summary: reqData.summary,
            description: reqData.description,
            location: reqData.location,
            colorId: reqData.colorId,
            start: reqData.start ? { dateTime: reqData.start } : undefined,
            end: reqData.end ? { dateTime: reqData.end } : undefined,
            conferenceData: {
               conferenceSolution: {
                  key: {
                     type: 'hangoutsMeet'
                  }
               },
               conferenceId: reqData.conferenceData?.id,
               entryPoints: [
                  {
                     entryPointType: 'video',
                     uri: reqData.conferenceData?.joinUrl
                  }
               ]
            }
         }

         // Get target calendar for optimistic update
         const optimisticCalendar = {
            id: reqData.calendarId || reqData.originalCalendarId,
            summary: reqData.calendarSummary || 'Calendar',
            backgroundColor: reqData.calendarBackgroundColor || '#3174ad'
         }

         dispatch({
            type: UPDATE_CALENDAR_EVENT,
            payload: {
               event: optimisticEventData,
               calendar: optimisticCalendar,
               originalEventId: reqData.eventId
            }
         })

         if (reqData.task_id && typeof reqData.slot_index === 'number') {
            // Optimistic update - Page | Task
            dispatch({
               type: UPDATE_TASK_SCHEDULE,
               payload: {
                  task_id: reqData.task_id,
                  slot_index: reqData.slot_index,
                  start: reqData.start,
                  end: reqData.end,
                  update_date: new Date().toISOString(),
                  target_event_index: reqData.target_event_index,
                  view_target_event_at: new Date()
               }
            })
         }

         const res = await api.post(
            `/calendar/update-event/${reqData.eventId}`,
            reqData
         )

         // Dispatch actual update with server response
         if (res.data?.event) {
            dispatch({
               type: UPDATE_CALENDAR_EVENT,
               payload: { ...res.data, originalEventId: reqData.eventId }
            })
         } else {
            throw new Error(
               'Unexpected response format from /calendar/update-event'
            )
         }
      } catch (err) {
         // On error, we might want to revert the optimistic update
         // For now, just show the error - the next calendar refresh will correct the state
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Update Google Event Time Action (for drag/drop operations)
 * Updates only the start and end time of an event, preserving all other data
 * @param {Object} reqData - Request data for event time update
 * @param {string} reqData.eventId - Event ID to update
 * @param {string} reqData.start - New start time (ISO string)
 * @param {string} reqData.end - New end time (ISO string)
 * @param {string} reqData.accountEmail - Google account ID
 * @param {string} reqData.calendarId - Calendar ID where event exists
 * @param {string} reqData.originalCalendarId - Original calendar ID
 * @param {string} [reqData.task_id] - Task ID for synced events
 * @param {number} [reqData.slot_index] - Slot index for synced events
 * @param {number} [reqData.target_event_index] - Target event index for task detail updates
 */
export const updateGoogleEventTimeAction =
   (reqData) => async (dispatch, getState) => {
      try {
         // Optimistic update - Calendar - update event times in state
         dispatch({
            type: UPDATE_CALENDAR_EVENT_TIME,
            payload: {
               eventId: reqData.eventId,
               start: reqData.start ? { dateTime: reqData.start } : undefined,
               end: reqData.end ? { dateTime: reqData.end } : undefined
            }
         })
         if (reqData.task_id && typeof reqData.slot_index === 'number') {
            // Optimistic update - Page | Task
            dispatch({
               type: UPDATE_TASK_SCHEDULE,
               payload: {
                  task_id: reqData.task_id,
                  slot_index: reqData.slot_index,
                  start: reqData.start,
                  end: reqData.end,
                  update_date: new Date().toISOString(),
                  target_event_index: reqData.target_event_index,
                  view_target_event_at: new Date()
               }
            })
         }

         // API call to update event times only
         await api.post(`/calendar/update-event/${reqData.eventId}`, reqData)
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Delete Google Event Action
 * Deletes an event from Google Calendar
 * @param {Object} reqData - Request data for event deletion
 * @param {string} reqData.eventId - Event ID to delete
 * @param {string} reqData.accountEmail - Google account ID
 */
export const deleteGoogleEventAction =
   (reqData) => async (dispatch, getState) => {
      // Optimistic update - Calendar - remove event from state
      dispatch({
         type: DELETE_CALENDAR_EVENT,
         payload: {
            id: reqData.eventId
         }
      })
      try {
         await api.delete(`/calendar/delete-event/${reqData.eventId}`, {
            data: reqData
         })
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Change Calendar Visibility Action
 * Toggles the visibility of a specific calendar
 * @param {string} calendarId - Calendar ID to toggle visibility
 */
export const changeCalendarVisibilityAction =
   (calendarId) => async (dispatch, getState) => {
      try {
         dispatch({
            type: UPDATE_CALENDAR_VISIBILITY,
            payload: { calendarId }
         })
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Disconnect Google Account Action
 * Removes Google Account connection and clears calendar data
 * @param {Object} reqData - Request data for disconnection
 * @param {string} reqData.account_email - Google account ID to disconnect
 */
export const disconnectGoogleAccountAction =
   (reqData) => async (dispatch, getState) => {
      // Optimistic update - Calendar - remove account from state
      dispatch({
         type: REMOVE_CALENDAR_ACCOUNT,
         payload: {
            accountEmail: reqData.account_email
         }
      })
      try {
         await api.delete(`/calendar/disconnect/${reqData.account_email}`)
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Create Calendar Event Action
 * Creates a new calendar event in the store to show event creation UI
 * @param {Object} newEvent - Slot information from react-big-calendar
 * @param {Date} newEvent.dateTime.start - Start time of the selected slot
 * @param {Date} newEvent.dateTime.end - End time of the selected slot
 * @param {Object} mousePosition - Mouse position for popover placement
 */
export const createCalendarEventAction = (newEvent, mousePosition) => ({
   type: CREATE_CALENDAR_EVENT,
   payload: {
      newEvent,
      mousePosition
   }
})

/**
 * Clear Calendar Event Action
 * Clears the new calendar event creation state
 */
export const clearCalendarEventAction = () => ({
   type: CLEAR_CALENDAR_EVENT
})

/**
 * Create Google Event Action
 * Creates a new event in Google Calendar
 * @param {Object} reqData - Request data for event creation
 * @param {string} reqData.accountEmail - Google account email
 * @param {string} reqData.calendarId - Target calendar ID
 * @param {string} reqData.summary - Event title
 * @param {string} reqData.start - Start time (ISO string)
 * @param {string} reqData.end - End time (ISO string)
 * @param {string} [reqData.description] - Event description
 * @param {string} [reqData.location] - Event location
 * @param {string} [reqData.colorId] - Event color ID
 */
export const createGoogleEventAction =
   (reqData) => async (dispatch, getState) => {
      try {
         const res = await api.post('/calendar/create-event', reqData)

         // Add the new event to the calendar state
         dispatch({
            type: UPDATE_CALENDAR_EVENT,
            payload: { ...res.data, originalEventId: 'new' }
         })

         // Clear the event creation state
         dispatch(clearCalendarEventAction())

         return res.data
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
         throw err
      }
   }

/**
 * Create Google Meet Space Action
 * Creates a new Google Meet space using the Google Meet API
 * @param {Object} reqData - Request data for Meet space creation
 * @param {string} reqData.accountEmail - Google account email to use
 * @param {Object} reqData.config - Optional Meet space configuration
 */
export const createGoogleMeetSpaceAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-meet/create-space', reqData)

      if (res.data?.success) {
         return res.data
      } else {
         throw new Error(
            'Unexpected response format from /google-meet/create-space'
         )
      }
   } catch (err) {
      dispatch(
         setAlertAction(
            'Oops!',
            'Failed to generate Google Meet link. Please try again.',
            'error'
         )
      )
      return null
   }
}

// =============================================================================
// UPDATE CALENDAR EVENT ACTION
// =============================================================================

export const updateNewEventAction = (updatedEvent) => (dispatch, getState) => {
   const { calendar } = getState()

   // Find the associated calendar
   const associatedCalendar = calendar.googleCalendars.find(
      (cal) => cal.calendarId === updatedEvent.calendarId
   )

   // Get target calendar for optimistic update
   const formattedcalendar = {
      id: associatedCalendar?.calendarId,
      summary: associatedCalendar?.title,
      backgroundColor: associatedCalendar?.color
   }

   if (associatedCalendar) {
      dispatch({
         type: UPDATE_CALENDAR_EVENT,
         payload: {
            event: updatedEvent,
            calendar: formattedcalendar,
            originalEventId: 'new'
         }
      })
   }
}
