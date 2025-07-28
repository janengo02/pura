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
   GOOGLE_CALENDAR_GET_DEFAULT_ACCOUNT
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
                  range: visibleRange,
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
 */
export const updateGoogleEventAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(
         `/google-account/update-event/${reqData.eventId}`,
         reqData
      )

      // @todo: Optimistic transform state
      if (res.data?.event) {
         dispatch({
            type: GOOGLE_CALENDAR_UPDATE_EVENT,
            payload: res.data.event
         })
      } else {
         throw new Error(
            'Unexpected response format from /google-account/update-event'
         )
      }
   } catch (err) {
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
   try {
      const res = await api.delete(
         `/google-account/delete-event/${reqData.eventId}`,
         {
            data: reqData
         }
      )

      if (res.data?.event) {
         dispatch({
            type: GOOGLE_CALENDAR_UPDATE_EVENT,
            payload: res.data.event
         })
      } else {
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
   try {
      await api.delete(`/google-account/disconnect/${reqData.account_email}`)

      // Clear calendar state
      dispatch({
         type: GOOGLE_CALENDAR_REMOVE_ACCOUNT,
         payload: {
            accountEmail: reqData.account_email
         }
      })
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
