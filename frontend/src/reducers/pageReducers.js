import {
   GET_PAGE,
   MOVE_TASK,
   PAGE_ERROR,
   CREATE_PROGRESS,
   UPDATE_PROGRESS,
   DELETE_PROGRESS,
   CREATE_GROUP,
   UPDATE_GROUP,
   DELETE_GROUP,
   CREATE_TASK,
   UPDATE_TASK,
   DELETE_TASK,
   FILTER_SCHEDULE,
   FILTER_NAME
} from '../actions/types'
import {
   moveTask,
   createGroup,
   deleteGroup,
   createProgress,
   deleteProgress,
   createTask,
   deleteTask
} from '@pura/shared'

import {
   updateProgress,
   updateGroup,
   getDefaultSchedule,
   getDefaultName
} from './pageReducersHelpers'

const initialState = {
   pages: [],
   group_order: [],
   progress_order: [],
   task_map: [],
   tasks: [],
   title: null,
   user: null,
   filter: {
      schedule: getDefaultSchedule(),
      name: getDefaultName()
   },
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
            ...createProgress({
               progress_order: state.progress_order,
               group_order: state.group_order,
               task_map: state.task_map,
               newProgress: payload
            }),
            loading: false,
            error: false
         }
      case UPDATE_PROGRESS:
         return {
            ...state,
            ...updateProgress({
               progress_order: state.progress_order,
               updatedProgress: payload
            }),
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
            ...createGroup({
               tasks: state.tasks,
               task_map: state.task_map,
               group_order: state.group_order,
               progress_order: state.progress_order,
               newGroup: payload
            }),
            loading: false,
            error: false
         }
      case UPDATE_GROUP:
         return {
            ...state,
            ...updateGroup({
               group_order: state.group_order,
               updatedGroup: payload
            }),
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
            ...createTask({
               new_task_info: payload,
               group_order: state.group_order,
               progress_order: state.progress_order,
               task_map: state.task_map,
               tasks: state.tasks
            }),
            loading: false,
            error: false
         }
      case UPDATE_TASK:
         return {
            ...state,
            tasks: state.tasks.map(task => 
               task._id === payload.task_id 
                  ? {
                       ...task,
                       title: payload.title !== undefined ? payload.title : task.title,
                       content: payload.content !== undefined ? payload.content : task.content,
                       update_date: payload.update_date || task.update_date
                    }
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
      case FILTER_SCHEDULE:
         return {
            ...state,
            filter: {
               ...state.filter,
               schedule: payload.schedule
            },
            loading: false,
            error: false
         }
      case FILTER_NAME:
         return {
            ...state,
            filter: {
               ...state.filter,
               name: payload.name
            },
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
