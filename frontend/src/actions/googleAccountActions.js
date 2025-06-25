import { api } from '../utils'
import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   SHOW_TASK,
   GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
   GOOGLE_CALENDAR_UPDATE_EVENT,
   GOOGLE_CALENDAR_ADD_EVENT,
   GOOGLE_CALENDAR_ADD_ACCOUNT
} from './types'

// Helper for dispatching auth error
const googleAccountErrorHandler = (dispatch) => {
   dispatch({
      type: GOOGLE_CALENDAR_AUTH_ERROR
   })
}

export const loadCalendarAction =
   (visibleRange, tasksArray) => async (dispatch) => {
      try {
         const res = await api.get('/google-account/list-events', {
            params: { minDate: visibleRange[0], maxDate: visibleRange[1] }
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
         googleAccountErrorHandler(dispatch)
      }
   }

// Create Google Account Tokens
export const addGoogleAccountAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-account/add-account', reqData)
      if (res.data) {
         dispatch({
            type: GOOGLE_CALENDAR_ADD_ACCOUNT,
            payload: {
               data: res.data,
               range: reqData.range
            }
         })
      } else {
         throw new Error(
            'Unexpected response format from /google-account/list-events'
         )
      }
   } catch (err) {
      googleAccountErrorHandler(dispatch)
   }
}

// Create Google Calendar Event
export const createGoogleEventAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-account/create-event', reqData)
      dispatch({
         type: SHOW_TASK,
         payload: res.data.task
      })
      dispatch({
         type: GOOGLE_CALENDAR_ADD_EVENT,
         payload: {
            accountId: reqData.account_id,
            event: res.data.event
         }
      })
   } catch (err) {
      googleAccountErrorHandler(dispatch)
   }
}

// Delete Google Calendar Event
export const deleteEventAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(
         `/google-account/delete-event/${reqData.eventId}`,
         reqData
      )
      dispatch({
         type: GOOGLE_CALENDAR_UPDATE_EVENT,
         payload: res.data.event
      })
   } catch (err) {
      googleAccountErrorHandler(dispatch)
   }
}

export const changeCalendarVisibilityAction =
   (calendarId) => async (dispatch) => {
      dispatch({
         type: GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
         payload: { calendarId }
      })
   }
