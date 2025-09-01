// =============================================================================
// IMPORTS
// =============================================================================

import { api } from '../utils'
import { setAlert } from '../reducers/alertSlice'
import { commonErrorHandler } from './errorActions'
import {
   UPDATE_CALENDAR_EVENT,
   UPDATE_CALENDAR_EVENT_TIME,
   ADD_CALENDAR_ACCOUNT,
   REMOVE_CALENDAR_ACCOUNT,
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

         if (res.data?.accountEmail) {
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
         commonErrorHandler(dispatch, err)
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
 * @param {string} [reqData.taskId] - Task ID for synced events
 * @param {number} [reqData.slotIndex] - Slot index for synced events
 * @param {number} [reqData.targetEventIndex] - Target event index for task detail updates
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

         if (reqData.taskId && typeof reqData.slotIndex === 'number') {
            // Optimistic update - Page | Task
            dispatch({
               type: UPDATE_TASK_SCHEDULE,
               payload: {
                  taskId: reqData.taskId,
                  slotIndex: reqData.slotIndex,
                  start: reqData.start,
                  end: reqData.end,
                  updateDate: new Date().toISOString(),
                  targetEventIndex: reqData.targetEventIndex,
                  viewTargetEventAt: new Date()
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
         commonErrorHandler(dispatch, err)
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
 * @param {string} [reqData.taskId] - Task ID for synced events
 * @param {number} [reqData.slotIndex] - Slot index for synced events
 * @param {number} [reqData.targetEventIndex] - Target event index for task detail updates
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
         if (reqData.taskId && typeof reqData.slotIndex === 'number') {
            // Optimistic update - Page | Task
            dispatch({
               type: UPDATE_TASK_SCHEDULE,
               payload: {
                  taskId: reqData.taskId,
                  slotIndex: reqData.slotIndex,
                  start: reqData.start,
                  end: reqData.end,
                  updateDate: new Date().toISOString(),
                  targetEventIndex: reqData.targetEventIndex,
                  viewTargetEventAt: new Date()
               }
            })
         }

         // API call to update event times only
         await api.post(`/calendar/update-event/${reqData.eventId}`, reqData)
      } catch (err) {
         commonErrorHandler(dispatch, err)
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
         commonErrorHandler(dispatch, err)
      }
   }


/**
 * Disconnect Google Account Action
 * Removes Google Account connection and clears calendar data
 * @param {Object} reqData - Request data for disconnection
 * @param {string} reqData.accountEmail - Google account ID to disconnect
 */
export const disconnectGoogleAccountAction =
   (reqData) => async (dispatch, getState) => {
      // Optimistic update - Calendar - remove account from state
      dispatch({
         type: REMOVE_CALENDAR_ACCOUNT,
         payload: {
            accountEmail: reqData.accountEmail
         }
      })
      try {
         await api.delete(`/calendar/disconnect/${reqData.accountEmail}`)
      } catch (err) {
         commonErrorHandler(dispatch, err)
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
         commonErrorHandler(dispatch, err)
         throw err
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
