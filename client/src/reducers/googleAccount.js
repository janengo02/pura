import {
   GOOGLE_CALENDAR_LOGGED_IN,
   GOOGLE_CALENDAR_AUTH_ERROR
} from '../actions/types'
import { calendarPage } from '../utils/formatter'

const initialState = {
   isLoggedIn: null,
   googleEvents: null,
   account: null,
   loading: true
}

function googleAccountReducer(state = initialState, action) {
   const { type, payload } = action
   switch (type) {
      case GOOGLE_CALENDAR_LOGGED_IN:
         return {
            ...state,
            isLoggedIn: true,
            googleEvents: calendarPage(payload.items),
            account: payload.summary,
            loading: false
         }
      case GOOGLE_CALENDAR_AUTH_ERROR:
         return {
            ...state,
            isLoggedIn: false,
            googleEvents: null,
            account: null,
            loading: false
         }
      default:
         return state
   }
}

export default googleAccountReducer
