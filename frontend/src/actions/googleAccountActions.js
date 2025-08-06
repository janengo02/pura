// =============================================================================
// IMPORTS
// =============================================================================

import { api } from '../utils'
import { setAlertAction } from './alertActions'
import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
   GOOGLE_CALENDAR_UPDATE_EVENT,
   GOOGLE_CALENDAR_ADD_ACCOUNT,
   GOOGLE_CALENDAR_REMOVE_ACCOUNT,
   GOOGLE_CALENDAR_SET_DEFAULT_ACCOUNT,
   GOOGLE_CALENDAR_GET_DEFAULT_ACCOUNT,
   GOOGLE_CALENDAR_DELETE_EVENT,
   UPDATE_TASK_SCHEDULE,
   UPDATE_PAGE_TASK_SCHEDULE_SLOT
} from './types'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Helper for fatal error dispatch - similar to pageActionFatalErrorHandler
 * Used for critical errors that prevent calendar functionality
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} err - Error object
 */
export const googleAccountFatalErrorHandler = (dispatch, err) => {
   const errors = err?.response?.data?.errors || [
      { title: 'alert-oops', msg: 'alert-server_error' }
   ]

   // Dispatch auth error to reset calendar state
   dispatch({
      type: GOOGLE_CALENDAR_AUTH_ERROR
   })

   // Show alerts for each error
   if (errors) {
      errors.forEach((error) =>
         dispatch(
            setAlertAction(
               error.title || 'alert-oops',
               error.msg || 'alert-server_error',
               'error'
            )
         )
      )
   }
}

/**
 * Helper for recoverable error dispatch - similar to pageActionErrorHandler
 * Used for errors that allow retry or graceful degradation
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} err - Error object
 * @param {string} accountEmail - Optional account email for context
 */
export const googleAccountErrorHandler = (
   dispatch,
   err,
   accountEmail = null
) => {
   const errors = err?.response?.data?.errors || [
      { title: 'alert-oops', msg: 'alert-server_error' }
   ]

   // Show alerts for each error
   if (errors) {
      errors.forEach((error) =>
         dispatch(
            setAlertAction(
               error.title || 'alert-oops',
               error.msg || 'alert-server_error',
               'error'
            )
         )
      )
   }
}

// =============================================================================
// ACTION CREATORS
// =============================================================================
/**
 * Change calendar date range
 * @param {Array} range - Date range [startDate, endDate]
 * @returns {Object} Redux action
 */
export const changeCalendarRangeAction = (range) => ({
   type: 'CALENDAR_CHANGE_RANGE',
   payload: { range }
})
/**
 * Load Calendar Action
 * Loads Google Calendar events for the specified date range
 * @param {Array} visibleRange - Array containing start and end dates
 * @param {Array} tasksArray - Array of existing tasks
 */
export const loadCalendarAction =
   (visibleRange, tasksArray) => async (dispatch) => {
      try {
         const res = await api.get('/google-account/list-events', {
            params: {
               minDate: visibleRange[0],
               maxDate: visibleRange[1]
            }
         })

         if (Array.isArray(res.data)) {
            dispatch({
               type: GOOGLE_CALENDAR_LOADED,
               payload: {
                  data: res.data,
                  tasks: tasksArray
               }
            })
         } else {
            throw new Error(
               'Unexpected response format from /google-account/list-events'
            )
         }
      } catch (err) {
         googleAccountFatalErrorHandler(dispatch, err)
      }
   }

/**
 * Add Google Account Action
 * Adds a new Google account connection
 * @param {Object} reqData - Request data for adding account
 * @param {string} reqData.code - OAuth authorization code
 * @param {Array} reqData.range - Date range for initial sync
 */
export const addGoogleAccountAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-account/add-account', reqData)

      if (res.data?.account_email) {
         dispatch({
            type: GOOGLE_CALENDAR_ADD_ACCOUNT,
            payload: {
               data: res.data,
               range: reqData.range
            }
         })
      } else {
         throw new Error(
            'Unexpected response format from /google-account/add-account'
         )
      }
   } catch (err) {
      googleAccountErrorHandler(dispatch, err)
   }
}

/**
 * Set Default Google Account Action
 * Sets a specific Google account as the default account
 * @param {Object} reqData - Request data for setting default account
 * @param {string} reqData.account_email - ID of the account to set as default
 */
export const setDefaultGoogleAccountAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.put(
         `/google-account/set-default/${reqData.account_email}`
      )

      if (res.data?._id) {
         dispatch({
            type: GOOGLE_CALENDAR_SET_DEFAULT_ACCOUNT,
            payload: {
               accountEmail: reqData.account_email,
               accountData: res.data
            }
         })
      } else {
         throw new Error(
            'Unexpected response format from /google-account/set-default'
         )
      }
   } catch (err) {
      googleAccountErrorHandler(dispatch, err, reqData.account_email)
   }
}

/**
 * Get Default Google Account Action
 * Retrieves the current default Google account
 */
export const getDefaultGoogleAccountAction = () => async (dispatch) => {
   try {
      const res = await api.get('/google-account/default')

      if (res.data?._id) {
         dispatch({
            type: GOOGLE_CALENDAR_GET_DEFAULT_ACCOUNT,
            payload: res.data
         })
      } else {
         // No default account set - this is not an error
         dispatch({
            type: GOOGLE_CALENDAR_GET_DEFAULT_ACCOUNT,
            payload: null
         })
      }
   } catch (err) {
      // Only show error if it's not a 404 (no default account)
      if (err.response?.status !== 404) {
         googleAccountErrorHandler(dispatch, err)
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
 * @param {boolean} [reqData.task_detail_flg] - Task detail flag for optimistic task updates
 * @param {string} [reqData.task_id] - Task ID for synced events
 * @param {number} [reqData.slot_index] - Slot index for synced events
 * @param {number} [reqData.target_event_index] - Target event index for task detail updates
 */
export const updateGoogleEventAction = (reqData) => async (dispatch) => {
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
         type: GOOGLE_CALENDAR_UPDATE_EVENT,
         payload: {
            event: optimisticEventData,
            calendar: optimisticCalendar,
            originalEventId: reqData.eventId
         }
      })

      // Optimistic update - Task - update task details in state for synced events
      if (
         reqData.task_detail_flg &&
         reqData.task_id &&
         typeof reqData.slot_index === 'number'
      ) {
         dispatch({
            type: UPDATE_TASK_SCHEDULE,
            payload: {
               task_id: reqData.task_id,
               slot_index: reqData.slot_index,
               start: reqData.start,
               end: reqData.end,
               update_date: new Date().toISOString(),
               target_event_index: reqData.target_event_index
            }
         })
      }

      const res = await api.post(
         `/google-account/update-event/${reqData.eventId}`,
         reqData
      )

      // Dispatch actual update with server response
      if (res.data?.event) {
         dispatch({
            type: GOOGLE_CALENDAR_UPDATE_EVENT,
            payload: { ...res.data, originalEventId: reqData.eventId }
         })
         // Optimistic update - Page - update task schedule in tasks array for synced events
         if (reqData.task_id && typeof reqData.slot_index === 'number') {
            dispatch({
               type: UPDATE_PAGE_TASK_SCHEDULE_SLOT,
               payload: {
                  task_id: reqData.task_id,
                  slot_index: reqData.slot_index,
                  start: reqData.start,
                  end: reqData.end,
                  update_date: new Date().toISOString()
               }
            })
         }
      } else {
         throw new Error(
            'Unexpected response format from /google-account/update-event'
         )
      }
   } catch (err) {
      // On error, we might want to revert the optimistic update
      // For now, just show the error - the next calendar refresh will correct the state
      googleAccountErrorHandler(dispatch, err, reqData.accountEmail)
   }
}

/**
 * Delete Google Event Action
 * Deletes an event from Google Calendar
 * @param {Object} reqData - Request data for event deletion
 * @param {string} reqData.eventId - Event ID to delete
 * @param {string} reqData.accountEmail - Google account ID
 */
export const deleteGoogleEventAction = (reqData) => async (dispatch) => {
   // Optimistic update - Calendar - remove event from state
   dispatch({
      type: GOOGLE_CALENDAR_DELETE_EVENT,
      payload: {
         id: reqData.eventId
      }
   })
   try {
      const res = await api.delete(
         `/google-account/delete-event/${reqData.eventId}`,
         {
            data: reqData
         }
      )

      if (!res.data?.event?.deleted) {
         throw new Error(
            'Unexpected response format from /google-account/delete-event'
         )
      }
   } catch (err) {
      googleAccountErrorHandler(dispatch, err, reqData.accountEmail)
   }
}

/**
 * Change Calendar Visibility Action
 * Toggles the visibility of a specific calendar
 * @param {string} calendarId - Calendar ID to toggle visibility
 */
export const changeCalendarVisibilityAction =
   (calendarId) => async (dispatch) => {
      try {
         dispatch({
            type: GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
            payload: { calendarId }
         })
      } catch (err) {
         googleAccountErrorHandler(dispatch, err)
      }
   }

/**
 * Disconnect Google Account Action
 * Removes Google Account connection and clears calendar data
 * @param {Object} reqData - Request data for disconnection
 * @param {string} reqData.account_email - Google account ID to disconnect
 */
export const disconnectGoogleAccountAction = (reqData) => async (dispatch) => {
   // Optimistic update - Calendar - remove account from state
   dispatch({
      type: GOOGLE_CALENDAR_REMOVE_ACCOUNT,
      payload: {
         accountEmail: reqData.account_email
      }
   })
   try {
      await api.delete(`/google-account/disconnect/${reqData.account_email}`)
   } catch (err) {
      googleAccountErrorHandler(dispatch, err, reqData.account_email)
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
