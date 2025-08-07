import {
   GET_CALENDAR,
   CALENDAR_AUTH_ERROR,
   UPDATE_CALENDAR_VISIBILITY,
   UPDATE_CALENDAR_EVENT,
   UPDATE_CALENDAR_EVENT_TIME,
   UPDATE_TASK_BASIC,
   UPDATE_TASK_SCHEDULE,
   CREATE_TASK_SCHEDULE,
   DELETE_TASK_SCHEDULE,
   DELETE_TASK,
   CREATE_CALENDAR_EVENT,
   ADD_CALENDAR_ACCOUNT,
   REMOVE_CALENDAR_ACCOUNT,
   SET_CALENDAR_DEFAULT_ACCOUNT,
   GET_CALENDAR_DEFAULT_ACCOUNT,
   DELETE_CALENDAR_EVENT,
   SYNC_TASK_EVENT,
   UPDATE_CALENDAR_RANGE
} from '../actions/types'
import {
   addGoogleAccount,
   loadGoogleCalendar,
   changeGoogleCalendarVisibility,
   updateGoogleEvent,
   updateGoogleEventTime,
   createGoogleEvent,
   setDefaultGoogleAccount,
   getDefaultGoogleAccount,
   removeGoogleAccount,
   updateTaskEvents,
   updateTaskSchedule,
   addTaskScheduleSlot,
   removeTaskScheduleSlot,
   deleteTaskEvents,
   deleteGoogleEvent,
   syncTaskScheduleSlot
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
      case UPDATE_CALENDAR_RANGE:
         return {
            ...state,
            range: payload.range
         }
      case ADD_CALENDAR_ACCOUNT:
         return {
            ...state,
            isLoggedIn: true,
            ...addGoogleAccount({
               googleAccounts: state.googleAccounts,
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               newGoogleAccount: payload.data
            }),
            loading: false
         }
      case REMOVE_CALENDAR_ACCOUNT:
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
         }

      case GET_CALENDAR:
         return {
            ...state,
            isLoggedIn: true,
            ...loadGoogleCalendar({
               googleAccounts: payload.data,
               tasks: payload.tasks
            }),
            loading: false
         }

      case UPDATE_CALENDAR_VISIBILITY:
         return {
            ...state,
            ...changeGoogleCalendarVisibility({
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               calendarId: payload.calendarId
            })
         }

      case UPDATE_CALENDAR_EVENT:
         return {
            ...state,
            ...updateGoogleEvent({
               originalEventId: payload.originalEventId,
               googleEvents: state.googleEvents,
               updatedEvent: payload.event,
               updatedCalendar: payload.calendar
            })
         }

      case UPDATE_CALENDAR_EVENT_TIME:
         return {
            ...state,
            ...updateGoogleEventTime({
               eventId: payload.eventId,
               googleEvents: state.googleEvents,
               start: payload.start,
               end: payload.end
            })
         }

      case DELETE_CALENDAR_EVENT:
         return {
            ...state,
            ...deleteGoogleEvent({
               deletedEvent: payload,
               googleEvents: state.googleEvents
            })
         }

      case UPDATE_TASK_BASIC:
         return {
            ...state,
            ...updateTaskEvents({
               googleEvents: state.googleEvents,
               taskUpdateData: payload
            })
         }

      case UPDATE_TASK_SCHEDULE:
         return {
            ...state,
            ...updateTaskSchedule({
               googleEvents: state.googleEvents,
               scheduleUpdateData: payload
            })
         }

      case CREATE_TASK_SCHEDULE:
         return {
            ...state,
            ...addTaskScheduleSlot({
               googleEvents: state.googleEvents,
               addSlotData: payload
            })
         }

      case DELETE_TASK_SCHEDULE:
         return {
            ...state,
            ...removeTaskScheduleSlot({
               googleEvents: state.googleEvents,
               removalData: payload
            })
         }

      case DELETE_TASK:
         return {
            ...state,
            ...deleteTaskEvents({
               googleEvents: state.googleEvents,
               taskDeletionData: payload
            })
         }

      case CREATE_CALENDAR_EVENT:
         return {
            ...state,
            ...createGoogleEvent({
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               accountEmail: payload.accountEmail,
               newEvent: payload.event
            })
         }

      case SET_CALENDAR_DEFAULT_ACCOUNT:
         return {
            ...state,
            ...setDefaultGoogleAccount({
               googleAccounts: state.googleAccounts,
               accountEmail: payload.accountEmail,
               accountData: payload.accountData
            })
         }

      case GET_CALENDAR_DEFAULT_ACCOUNT:
         return {
            ...state,
            ...getDefaultGoogleAccount({
               defaultAccountData: payload
            })
         }

      case SYNC_TASK_EVENT:
         return {
            ...state,
            ...syncTaskScheduleSlot({
               googleAccounts: state.googleAccounts,
               googleCalendars: state.googleCalendars,
               googleEvents: state.googleEvents,
               accountEmail: payload.account_email,
               calendarId: payload.calendar_id,
               newEvent: payload.event,
               syncTask: payload.task,
               slotIndex: payload.slot_index
            })
         }

      case CALENDAR_AUTH_ERROR:
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
