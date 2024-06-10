import { api } from '../utils'
import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   SHOW_TASK,
   GET_PAGE
} from './types'

export const connectGoogle = () => async (dispatch) => {
   try {
      const res = await api.get('/google-account/list-events')
      if (res.data.summary) {
         dispatch({
            type: GOOGLE_CALENDAR_LOADED,
            payload: res.data
         })
      } else {
         dispatch({
            type: GOOGLE_CALENDAR_AUTH_ERROR
         })
      }
   } catch (err) {
      dispatch({
         type: GOOGLE_CALENDAR_AUTH_ERROR
      })
   }
}

// Create Google Account Tokens
export const createGoogleTokens = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-account/create-tokens', reqData)
      dispatch({
         type: GOOGLE_CALENDAR_LOADED,
         payload: res.data
      })
   } catch (err) {
      const errors = err.response.data.errors
      console.log(errors)
      //  @Todo Handle error
      // console.clear()
   }
}

// Create Google Calendar Event
export const createGoogleCalendarEvent = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/google-account/create-event', reqData)
      dispatch({
         type: GOOGLE_CALENDAR_LOADED,
         payload: res.data.events
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
         type: GOOGLE_CALENDAR_LOADED,
         payload: res.data.events
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
