import { GET_PAGE, MOVE_TASK, PAGE_ERROR } from '../actions/types'
import { optimisticMoveTask } from '../utils/optimistic'

const initialState = {
   // page: null,
   pages: [],
   group_order: [],
   progress_order: [],
   task_map: [],
   tasks: [],
   title: null,
   user: null,
   errors: null,
   _id: null,
   loading: true,
   error: false
}

function pageReducer(state = initialState, action) {
   const { type, payload } = action

   switch (type) {
      case GET_PAGE:
         return {
            ...state,
            ...payload,
            loading: false,
            error: false
         }
      case MOVE_TASK:
         const { task_map, tasks } = optimisticMoveTask(
            payload,
            state.tasks,
            state.task_map
         )
         return {
            ...state,
            task_map: task_map,
            tasks: tasks,
            loading: false,
            error: false
         }
      case PAGE_ERROR:
         return {
            ...state,
            ...payload,
            // page: payload,
            loading: false,
            error: true
         }
      default:
         return state
   }
}

export default pageReducer
