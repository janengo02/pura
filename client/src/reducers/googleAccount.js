import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
   CREATE_GOOGLE_EVENT,
   GOOGLE_CALENDAR_UPDATE_EVENT
} from '../actions/types'
import {
   calendarListChangeVisibilityFormatter,
   calendarListFormatter,
   calendarOwnerFormatter,
   eventListChangeVisibilityFormatter,
   eventListFormatter,
   newEventFormatter,
   updateEventFormatter
} from '../utils/formatter'

const initialState = {
   isLoggedIn: false,
   googleEvents: [],
   account: null,
   googleCalendars: [],
   loading: true,
   range: []
}

function googleAccountReducer(state = initialState, action) {
   const { type, payload } = action
   switch (type) {
      case GOOGLE_CALENDAR_LOADED:
         return {
            ...state,
            isLoggedIn: true,
            account: calendarOwnerFormatter(payload.data),
            googleEvents: eventListFormatter(
               state.googleCalendars,
               payload.data,
               payload.tasks
            ),
            googleCalendars: calendarListFormatter(
               state.googleCalendars,
               payload.data
            ),
            loading: false,
            range: payload.range
         }
      case GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY:
         return {
            ...state,
            googleEvents: eventListChangeVisibilityFormatter(
               state.googleEvents,
               payload.calendarId
            ),
            googleCalendars: calendarListChangeVisibilityFormatter(
               state.googleCalendars,
               payload.calendarId
            )
         }
      case CREATE_GOOGLE_EVENT:
         return {
            ...state,
            googleEvents: [
               ...state.googleEvents,
               newEventFormatter(payload, state.googleCalendars)
            ]
         }
      case GOOGLE_CALENDAR_UPDATE_EVENT:
         return {
            ...state,
            googleEvents: updateEventFormatter(state.googleEvents, payload)
         }
      case GOOGLE_CALENDAR_AUTH_ERROR:
         return {
            ...state,
            isLoggedIn: false,
            account: null,
            googleEvents: [],
            googleCalendars: [],
            loading: false,
            range: payload.range
         }
      default:
         return state
   }
}

export default googleAccountReducer
