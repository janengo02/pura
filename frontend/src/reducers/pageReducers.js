import { optimisticUpdateGroup } from '../actions/groupActions'
import {
   optimisticCreateProgress,
   optimisticDeleteProgress,
   optimisticUpdateProgress
} from '../actions/progressActions'
import { optimisticAddTask, optimisticDeleteTask } from '../actions/taskActions'
import {
   GET_PAGE,
   MOVE_TASK,
   PAGE_ERROR,
   CREATE_PROGRESS,
   UPDATE_PROGRESS,
   DELETE_PROGRESS,
   CREATE_GROUP,
   CONFIRM_CREATE_GROUP,
   UPDATE_GROUP,
   DELETE_GROUP,
   CREATE_TASK,
   DELETE_TASK
} from '../actions/types'
import { moveTask, addGroup, deleteGroup } from '@pura/shared'

const initialState = {
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
         return {
            ...state,
            ...moveTask({
               tasks: state.tasks,
               task_map: state.task_map,
               ...payload
            }),
            loading: false,
            error: false
         }
      case CREATE_PROGRESS:
         return {
            ...state,
            ...optimisticCreateProgress(
               payload,
               state.progress_order,
               state.group_order,
               state.task_map
            ),
            loading: false,
            error: false
         }
      case UPDATE_PROGRESS:
         return {
            ...state,
            ...optimisticUpdateProgress(payload, state.progress_order),
            loading: false,
            error: false
         }

      case DELETE_PROGRESS:
         return {
            ...state,
            ...optimisticDeleteProgress(
               payload,
               state.progress_order,
               state.group_order,
               state.tasks,
               state.task_map
            ),
            loading: false,
            error: false
         }
      case CREATE_GROUP:
         return {
            ...state,
            ...addGroup({
               tasks: state.tasks,
               task_map: state.task_map,
               group_order: state.group_order,
               progress_order: state.progress_order,
               newGroup: payload
            }),
            loading: false,
            error: false
         }
      case CONFIRM_CREATE_GROUP:
         return {
            ...state,
            group_order: state.group_order.map((group) =>
               group._id === payload.temp_group_id
                  ? { ...group, _id: payload.group_id }
                  : group
            ),
            loading: false,
            error: false
         }
      case UPDATE_GROUP:
         return {
            ...state,
            ...optimisticUpdateGroup(payload, state.group_order),
            loading: false,
            error: false
         }
      case DELETE_GROUP:
         return {
            ...state,
            ...deleteGroup({
               group_id: payload.group_id,
               progress_order: state.progress_order,
               group_order: state.group_order,
               tasks: state.tasks,
               task_map: state.task_map
            }),
            loading: false,
            error: false
         }
      case CREATE_TASK:
         return {
            ...state,
            ...optimisticAddTask(
               payload,
               state.group_order,
               state.progress_order,
               state.task_map,
               state.tasks
            ),
            loading: false,
            error: false
         }
      case DELETE_TASK:
         return {
            ...state,
            ...optimisticDeleteTask(payload, state.task_map, state.tasks),
            loading: false,
            error: false
         }
      case PAGE_ERROR:
         return {
            ...state,
            ...payload,
            loading: false,
            error: true
         }
      default:
         return state
   }
}

export default pageReducer
