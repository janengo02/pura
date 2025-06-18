import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
   GOOGLE_CALENDAR_UPDATE_EVENT,
   GOOGLE_CALENDAR_ADD_EVENT,
   GOOGLE_CALENDAR_ADD_ACCOUNT
} from '../actions/types'
import {
   accountListFormatter,
   addAccountCalendarListFormatter,
   addNewAccountEventListFormatter,
   addNewAccountListFormatter,
   calendarListChangeVisibilityFormatter,
   calendarListFormatter,
   eventListChangeVisibilityFormatter,
   eventListFormatter,
   updateEventFormatter,
   addEventFormatter
} from '../utils/formatter'

const initialState = {
   isLoggedIn: false,
   googleEvents: [],
   googleCalendars: [],
   googleAccounts: [],
   loading: true,
   range: []
}

function googleAccountReducer(state = initialState, action) {
   const { type, payload } = action
   switch (type) {
      case GOOGLE_CALENDAR_ADD_ACCOUNT:
         return {
            ...state,
            isLoggedIn: true,
            googleEvents: addNewAccountEventListFormatter(
               state.googleEvents,
               payload.data
            ),
            googleCalendars: addAccountCalendarListFormatter(
               state.googleCalendars,
               payload.data
            ),
            googleAccounts: addNewAccountListFormatter(
               state.googleAccounts,
               payload.data
            ),
            loading: false,
            range: payload.range
         }
      case GOOGLE_CALENDAR_LOADED:
         return {
            ...state,
            isLoggedIn: true,
            googleEvents: eventListFormatter(payload.data, payload.tasks),
            googleCalendars: calendarListFormatter(payload.data),
            googleAccounts: accountListFormatter(payload.data),
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
      case GOOGLE_CALENDAR_UPDATE_EVENT:
         return {
            ...state,
            googleEvents: updateEventFormatter(state.googleEvents, payload)
         }
      case GOOGLE_CALENDAR_ADD_EVENT:
         return {
            ...state,
            googleEvents: addEventFormatter(
               state.googleCalendars,
               state.googleEvents,
               payload.accountId,
               payload.event
            )
         }
      case GOOGLE_CALENDAR_AUTH_ERROR:
         return {
            ...state,
            isLoggedIn: false,
            googleEvents: [],
            googleCalendars: [],
            loading: false
         }
      default:
         return state
   }
}

export default googleAccountReducer
