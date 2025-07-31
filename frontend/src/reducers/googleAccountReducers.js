import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   GOOGLE_CALENDAR_CHANGE_CALENDAR_VISIBILITY,
   GOOGLE_CALENDAR_UPDATE_EVENT,
   GOOGLE_CALENDAR_UPDATE_TASK_EVENT,
   GOOGLE_CALENDAR_UPDATE_TASK_SCHEDULE,
   GOOGLE_CALENDAR_REMOVE_TASK_SCHEDULE_SLOT,
   GOOGLE_CALENDAR_DELETE_TASK_EVENTS,
   GOOGLE_CALENDAR_ADD_EVENT,
   GOOGLE_CALENDAR_ADD_ACCOUNT,
   GOOGLE_CALENDAR_REMOVE_ACCOUNT,
   GOOGLE_CALENDAR_SET_DEFAULT_ACCOUNT,
   GOOGLE_CALENDAR_GET_DEFAULT_ACCOUNT,
   GOOGLE_CALENDAR_DELETE_EVENT
} from '../actions/types'
import {
   addGoogleAccount,
   loadGoogleCalendar,
   changeGoogleCalendarVisibility,
   updateGoogleEvent,
   createGoogleEvent,
   setDefaultGoogleAccount,
   getDefaultGoogleAccount,
   removeGoogleAccount,
   updateTaskEvents,
   updateTaskSchedule,
   removeTaskScheduleSlot,
   deleteTaskEvents,
   deleteGoogleEvent
} from './googleAccountReducersHelpers'

const initialState = {
   isLoggedIn: false,
   googleEvents: [],
   googleCalendars: [],
   googleAccounts: [],
   defaultAccount: null,
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
      case GOOGLE_CALENDAR_REMOVE_ACCOUNT:
         return {
            ...state,
            isLoggedIn: true,
            ...removeGoogleAccount({
               googleAccounts: state.googleAccounts,
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               removedAccountEmail: payload.accountEmail
            }),
            loading: false
            // Keep existing range when removing account
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
               originalEventId: payload.originalEventId,
               googleEvents: state.googleEvents,
               updatedEvent: payload.event,
               updatedCalendar: payload.calendar
            })
         }

      case GOOGLE_CALENDAR_DELETE_EVENT:
         return {
            ...state,
            ...deleteGoogleEvent({
               deletedEvent: payload,
               googleEvents: state.googleEvents
            })
         }

      case GOOGLE_CALENDAR_UPDATE_TASK_EVENT:
         return {
            ...state,
            ...updateTaskEvents({
               googleEvents: state.googleEvents,
               taskUpdateData: payload
            })
         }

      case GOOGLE_CALENDAR_UPDATE_TASK_SCHEDULE:
         return {
            ...state,
            ...updateTaskSchedule({
               googleEvents: state.googleEvents,
               scheduleUpdateData: payload
            })
         }

      case GOOGLE_CALENDAR_REMOVE_TASK_SCHEDULE_SLOT:
         return {
            ...state,
            ...removeTaskScheduleSlot({
               googleEvents: state.googleEvents,
               removalData: payload
            })
         }

      case GOOGLE_CALENDAR_DELETE_TASK_EVENTS:
         return {
            ...state,
            ...deleteTaskEvents({
               googleEvents: state.googleEvents,
               taskDeletionData: payload
            })
         }

      case GOOGLE_CALENDAR_ADD_EVENT:
         return {
            ...state,
            ...createGoogleEvent({
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               accountEmail: payload.accountEmail,
               newEvent: payload.event
            })
         }

      case GOOGLE_CALENDAR_SET_DEFAULT_ACCOUNT:
         return {
            ...state,
            ...setDefaultGoogleAccount({
               googleAccounts: state.googleAccounts,
               accountEmail: payload.accountEmail,
               accountData: payload.accountData
            })
         }

      case GOOGLE_CALENDAR_GET_DEFAULT_ACCOUNT:
         return {
            ...state,
            ...getDefaultGoogleAccount({
               defaultAccountData: payload
            })
         }

      case GOOGLE_CALENDAR_AUTH_ERROR:
         return {
            ...state,
            isLoggedIn: false,
            googleEvents: [],
            googleCalendars: [],
            defaultAccount: null,
            loading: false
         }

      default:
         return state
   }
}

export default googleAccountReducer
