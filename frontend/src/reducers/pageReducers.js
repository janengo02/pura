import { optimisticUpdateGroup } from '../actions/groupActions'
import { optimisticUpdateProgress } from '../actions/progressActions'
import {
   GET_PAGE,
   MOVE_TASK,
   PAGE_ERROR,
   CREATE_PROGRESS,
   CONFIRM_CREATE_PROGRESS,
   UPDATE_PROGRESS,
   DELETE_PROGRESS,
   CREATE_GROUP,
   CONFIRM_CREATE_GROUP,
   UPDATE_GROUP,
   DELETE_GROUP,
   CREATE_TASK,
   CONFIRM_CREATE_TASK,
   DELETE_TASK
} from '../actions/types'
import {
   moveTask,
   addGroup,
   deleteGroup,
   addProgress,
   deleteProgress,
   addTask,
   deleteTask
} from '@pura/shared'

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
            ...addProgress({
               progress_order: state.progress_order,
               group_order: state.group_order,
               task_map: state.task_map,
               newProgress: payload
            }),
            loading: false,
            error: false
         }
      case CONFIRM_CREATE_PROGRESS:
         return {
            ...state,
            progress_order: state.progress_order.map((progress) =>
               progress._id === payload.temp_progress_id
                  ? { ...progress, _id: payload.progress_id }
                  : progress
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
            ...deleteProgress({
               progressIndex: state.progress_order.findIndex(
                  (p) => p && p._id === payload.progress_id
               ),
               progress_order: state.progress_order,
               group_order: state.group_order,
               tasks: state.tasks,
               task_map: state.task_map
            }),
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
               groupIndex: state.group_order.findIndex(
                  (g) => g && g._id === payload.group_id
               ),
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
            ...addTask({
               new_task_info: payload,
               group_order: state.group_order,
               progress_order: state.progress_order,
               task_map: state.task_map,
               tasks: state.tasks
            }),
            loading: false,
            error: false
         }
      case CONFIRM_CREATE_TASK:
         return {
            ...state,
            tasks: state.tasks.map((task) =>
               task._id === payload.temp_task_id
                  ? { ...task, _id: payload.task_id }
                  : task
            ),
            loading: false,
            error: false
         }
      case DELETE_TASK:
         return {
            ...state,
            ...deleteTask({
               task_id: payload.task_id,
               task_map: state.task_map,
               tasks: state.tasks
            }),
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
