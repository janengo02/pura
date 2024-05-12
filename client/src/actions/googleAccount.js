import { api } from '../utils'
import { GOOGLE_CALENDAR_LOGGED_IN, GOOGLE_CALENDAR_AUTH_ERROR } from './types'

export const connectGoogle = () => async (dispatch) => {
   try {
      const res = await api.get('/google-account/list-events')
      dispatch({
         type: GOOGLE_CALENDAR_LOGGED_IN,
         payload: res.data
      })
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
         type: GOOGLE_CALENDAR_LOGGED_IN,
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
      await api.post('/google-account/create-event', reqData)
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
