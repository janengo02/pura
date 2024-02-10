import { SHOW_TASK } from '../actions/types'

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
      default:
         return state
   }
}

export default taskReducer
