// =============================================================================
// TASK REDUCER
// =============================================================================

import { SHOW_TASK, CLEAR_TASK } from '../actions/types'

const initialState = {
   task: null
}

function taskReducer(state = initialState, action) {
   const { type, payload } = action

   switch (type) {
      case SHOW_TASK:
         return {
            ...state,
            task: payload
         }

      case CLEAR_TASK:
         return {
            ...state,
            task: null
         }

      default:
         return state
   }
}

export default taskReducer
