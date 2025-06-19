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

export const listGoogleEvents =
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
            dispatch({
               type: GOOGLE_CALENDAR_AUTH_ERROR,
               payload: { range: visibleRange }
            })
         }
      } catch (err) {
         dispatch({
            type: GOOGLE_CALENDAR_AUTH_ERROR,
            payload: { range: visibleRange }
         })
      }
   }

// Create Google Account Tokens
export const addGoogleAccount = (reqData) => async (dispatch) => {
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
         dispatch({
            type: GOOGLE_CALENDAR_AUTH_ERROR,
            payload: { range: reqData.range }
         })
      }
   } catch (err) {
      dispatch({
         type: GOOGLE_CALENDAR_AUTH_ERROR,
         payload: { range: reqData.range }
      })
   }
}

// Create Google Calendar Event
export const createGoogleEvent = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-account/create-event', reqData)
      dispatch({
         type: SHOW_TASK,
         payload: res.data.task
      })
      console.log(res.data.event)
      dispatch({
         type: GOOGLE_CALENDAR_ADD_EVENT,
         payload: {
            accountId: reqData.account_id,
            event: res.data.event
         }
      })
   } catch (err) {
      const errors = err?.response?.data?.errors || err?.response?.data || {}
      console.log(errors)
      dispatch({
         type: GOOGLE_CALENDAR_AUTH_ERROR
      })
      //  @Todo Handle error
      // console.clear()
   }
}

// Delete Google Calendar Event
export const deleteGoogleCalendarEvent = (reqData) => async (dispatch) => {
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
      const errors = err.response.data.errors
      console.log(errors)
      dispatch({
         type: GOOGLE_CALENDAR_AUTH_ERROR
      })
      //  @Todo Handle error
      // console.clear()
   }
}

export const setVisibleCalendar = (calendarId) => async (dispatch) => {
   dispatch({
      type: GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
      payload: { calendarId }
   })
}
