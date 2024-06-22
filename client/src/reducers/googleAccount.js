import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   GOOGLE_CALENDAR_SYNCED_EVENT_LOADING
} from '../actions/types'
import {
   calendarListFormatter,
   calendarOwnerFormatter,
   eventListFormatter
} from '../utils/formatter'

const initialState = {
   isLoggedIn: false,
   googleEvents: [],
   account: null,
   googleCalendars: [],
   loading: true,
   syncedEventLoading: '',
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
            googleEvents: eventListFormatter(payload.data),
            googleCalendars: calendarListFormatter(payload.data),
            loading: false,
            syncedEventLoading: '',
            range: payload.range
         }
      case GOOGLE_CALENDAR_SYNCED_EVENT_LOADING:
         return {
            ...state,
            syncedEventLoading: payload.synced_g_event
         }
      case GOOGLE_CALENDAR_AUTH_ERROR:
         return {
            ...state,
            isLoggedIn: false,
            account: null,
            googleEvents: [],
            googleCalendars: [],
            loading: false,
            syncedEventLoading: '',
            range: payload.range
         }
      default:
         return state
   }
}

export default googleAccountReducer
