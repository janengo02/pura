import {
   GOOGLE_CALENDAR_LOGGED_IN,
   GOOGLE_CALENDAR_AUTH_ERROR
} from '../actions/types'

const initialState = {
   isLoggedIn: null,
   googleEvents: null,
   account: null
}

function googleAccountReducer(state = initialState, action) {
   const { type, payload } = action
   switch (type) {
      case GOOGLE_CALENDAR_LOGGED_IN:
         return {
            ...state,
            isLoggedIn: true,
            googleEvents: payload.items,
            account: payload.summary
         }
      case GOOGLE_CALENDAR_AUTH_ERROR:
         return {
            ...state,
            isLoggedIn: false
         }
      default:
         return state
   }
}

export default googleAccountReducer
