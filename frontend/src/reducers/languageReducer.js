// =============================================================================
// LANGUAGE REDUCER
// =============================================================================

import { CHANGE_LANGUAGE, LANGUAGE_ERROR } from '../actions/types'

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState = {
   current: 'en', // Default language
   error: null,
   isChanging: false
}

// =============================================================================
// REDUCER
// =============================================================================

function languageReducer(state = initialState, action) {
   const { type, payload } = action

   switch (type) {
      case CHANGE_LANGUAGE:
         return {
            ...state,
            current: payload,
            error: null,
            isChanging: false
         }

      case LANGUAGE_ERROR:
         return {
            ...state,
            error: payload,
            isChanging: false
         }

      default:
         return state
   }
}

export default languageReducer
