import { GET_PAGE, MOVE_TASK, PAGE_ERROR } from '../actions/types'

const initialState = {
   page: null,
   pages: [],
   loading: true,
   error: false
}

function pageReducer(state = initialState, action) {
   const { type, payload } = action

   switch (type) {
      case GET_PAGE:
         return {
            ...state,
            page: payload,
            loading: false,
            error: false
         }
      case MOVE_TASK:
         return {
            ...state,
            page: {
               ...state.page,
               task_map: payload.task_map,
               tasks: payload.tasks
            },
            loading: false,
            error: false
         }
      case PAGE_ERROR:
         return {
            ...state,
            page: payload,
            loading: false,
            error: true
         }
      default:
         return state
   }
}

export default pageReducer
