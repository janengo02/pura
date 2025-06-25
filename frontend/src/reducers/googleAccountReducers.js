import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
   GOOGLE_CALENDAR_UPDATE_EVENT,
   GOOGLE_CALENDAR_ADD_EVENT,
   GOOGLE_CALENDAR_ADD_ACCOUNT
} from '../actions/types'
import {
   addGoogleAccount,
   loadGoogleCalendar,
   changeGoogleCalendarVisibility,
   updateGoogleEvent,
   createGoogleEvent
} from './googleAccountReducersHelpers'

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
            ...addGoogleAccount({
               googleAccounts: state.googleAccounts,
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               newGoogleAccount: payload.data
            }),
            loading: false,
            range: payload.range
         }
      case GOOGLE_CALENDAR_LOADED:
         return {
            ...state,
            isLoggedIn: true,
            ...loadGoogleCalendar({
               googleAccounts: payload.data,
               tasks: payload.tasks
            }),
            loading: false,
            range: payload.range
         }
      case GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY:
         return {
            ...state,
            ...changeGoogleCalendarVisibility({
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               calendarId: payload.calendarId
            })
         }
      case GOOGLE_CALENDAR_UPDATE_EVENT:
         return {
            ...state,
            ...updateGoogleEvent({
               googleEvents: state.googleEvents,
               updatedEvent: payload
            })
         }
      case GOOGLE_CALENDAR_ADD_EVENT:
         return {
            ...state,
            ...createGoogleEvent({
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               accountId: payload.accountId,
               newEvent: payload.event
            })
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
