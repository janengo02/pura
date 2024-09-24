import { START_LOADING, END_LOADING } from '../actions/types'

const initialState = true

// Loading state of the whole app (Not used for child components)
function loadingReducer(state = initialState, action) {
   const { type } = action
   switch (type) {
      case START_LOADING:
         return true
      case END_LOADING:
         return false
      default:
         return state
   }
}

export default loadingReducer
