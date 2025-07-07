import { TOGGLE_THEME, SET_THEME, INITIALIZE_THEME } from '../actions/types'

const initialState = {
   current: 'light'
}

export default function themeReducer(state = initialState, action) {
   const { type, payload } = action

   switch (type) {
      case TOGGLE_THEME:
      case SET_THEME:
      case INITIALIZE_THEME:
         return {
            ...state,
            current: payload
         }
      default:
         return state
   }
}
