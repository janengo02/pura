import { api } from '../utils'
import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   SHOW_TASK,
   GET_PAGE,
   GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
   CREATE_GOOGLE_EVENT,
   GOOGLE_CALENDAR_UPDATE_EVENT
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
export const createGoogleTokens = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-account/create-tokens', reqData)
      if (Array.isArray(res.data)) {
         dispatch({
            type: GOOGLE_CALENDAR_LOADED,
            payload: {
               data: res.data,
               range: reqData.range,
               tasks: reqData.tasks
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
export const createGoogleCalendarEvent = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-account/create-event', reqData)
      dispatch({
         type: CREATE_GOOGLE_EVENT,
         payload: res.data.event
      })
      dispatch({
         type: GET_PAGE,
         payload: res.data.page
      })
      dispatch({
         type: SHOW_TASK,
         payload: res.data.task
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
      dispatch({
         type: GET_PAGE,
         payload: res.data.page
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
