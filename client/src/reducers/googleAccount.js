import {
   GOOGLE_CALENDAR_LOADED,
   GOOGLE_CALENDAR_AUTH_ERROR,
   GOOGLE_CALENDAR_SYNCED_EVENT_LOADING
} from '../actions/types'
import { calendarPage } from '../utils/formatter'

const initialState = {
   isLoggedIn: false,
   googleEvents: [],
   account: null,
   loading: true,
   syncedEventLoading: ''
}

function googleAccountReducer(state = initialState, action) {
   const { type, payload } = action
   switch (type) {
      case GOOGLE_CALENDAR_LOADED:
         return {
            ...state,
            isLoggedIn: true,
            googleEvents: calendarPage(payload.items),
            account: payload.summary,
            loading: false,
            syncedEventLoading: ''
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
            googleEvents: [],
            account: null,
            loading: false,
            syncedEventLoading: ''
         }
      default:
         return state
   }
}

export default googleAccountReducer
