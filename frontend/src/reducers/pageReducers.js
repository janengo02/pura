import {
   GET_PAGE,
   DROP_TASK,
   PAGE_ERROR,
   CREATE_PROGRESS,
   UPDATE_PROGRESS,
   DELETE_PROGRESS,
   CREATE_GROUP,
   UPDATE_GROUP,
   DELETE_GROUP,
   CREATE_TASK,
   UPDATE_TASK_BASIC,
   DELETE_TASK,
   CREATE_TASK_SCHEDULE,
   DELETE_TASK_SCHEDULE,
   UPDATE_TASK_SCHEDULE,
   SYNC_TASK_EVENT,
   FILTER_SCHEDULE,
   FILTER_NAME,
   LOGOUT
} from '../actions/types'

import {
   updateProgress,
   updateGroup,
   updateTask,
   addPageTaskScheduleSlot,
   removePageTaskScheduleSlot,
   updatePageTaskScheduleSlot,
   syncTaskScheduleInPage,
   updateFilterSchedule,
   updateFilterName,
   findProgressIndex,
   findGroupIndex,
   getDefaultSchedule,
   getDefaultName,
   moveTask,
   createGroup,
   deleteGroup,
   createProgress,
   deleteProgress,
   createTask,
   deleteTask
} from './pageReducersHelpers'

const initialState = {
   pages: [],
   groupOrder: [],
   progressOrder: [],
   taskMap: [],
   tasks: [],
   title: null,
   user: null,
   filter: {
      schedule: getDefaultSchedule(),
      name: getDefaultName()
   },
   errors: null,
   id: null,
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
      case DROP_TASK:
         return {
            ...state,
            ...moveTask({
               tasks: state.tasks,
               taskMap: state.taskMap,
               ...payload
            }),
            loading: false,
            error: false
         }
      case CREATE_PROGRESS:
         return {
            ...state,
            ...createProgress({
               progressOrder: state.progressOrder,
               groupOrder: state.groupOrder,
               taskMap: state.taskMap,
               newProgress: payload
            }),
            loading: false,
            error: false
         }
      case UPDATE_PROGRESS:
         return {
            ...state,
            ...updateProgress({
               progressOrder: state.progressOrder,
               updatedProgress: payload
            }),
            loading: false,
            error: false
         }

      case DELETE_PROGRESS:
         return {
            ...state,
            ...deleteProgress({
               progressIndex: findProgressIndex(
                  state.progressOrder,
                  payload.progressId
               ),
               progressOrder: state.progressOrder,
               groupOrder: state.groupOrder,
               tasks: state.tasks,
               taskMap: state.taskMap
            }),
            loading: false,
            error: false
         }
      case CREATE_GROUP:
         return {
            ...state,
            ...createGroup({
               tasks: state.tasks,
               taskMap: state.taskMap,
               groupOrder: state.groupOrder,
               progressOrder: state.progressOrder,
               newGroup: payload
            }),
            loading: false,
            error: false
         }
      case UPDATE_GROUP:
         return {
            ...state,
            ...updateGroup({
               groupOrder: state.groupOrder,
               updatedGroup: payload
            }),
            loading: false,
            error: false
         }
      case DELETE_GROUP:
         return {
            ...state,
            ...deleteGroup({
               groupIndex: findGroupIndex(state.groupOrder, payload.groupId),
               progressOrder: state.progressOrder,
               groupOrder: state.groupOrder,
               tasks: state.tasks,
               taskMap: state.taskMap
            }),
            loading: false,
            error: false
         }
      case CREATE_TASK:
         return {
            ...state,
            ...createTask({
               new_task_info: payload,
               groupOrder: state.groupOrder,
               progressOrder: state.progressOrder,
               taskMap: state.taskMap,
               tasks: state.tasks
            }),
            loading: false,
            error: false
         }
      case UPDATE_TASK_BASIC:
         return {
            ...state,
            ...updateTask({
               tasks: state.tasks,
               payload
            }),
            loading: false,
            error: false
         }
      case DELETE_TASK_SCHEDULE:
         return {
            ...state,
            ...removePageTaskScheduleSlot({
               tasks: state.tasks,
               payload
            }),
            loading: false,
            error: false
         }
      case CREATE_TASK_SCHEDULE:
         return {
            ...state,
            ...addPageTaskScheduleSlot({
               tasks: state.tasks,
               payload
            }),
            loading: false,
            error: false
         }
      case UPDATE_TASK_SCHEDULE:
         return {
            ...state,
            ...updatePageTaskScheduleSlot({
               tasks: state.tasks,
               payload
            }),
            loading: false,
            error: false
         }
      case SYNC_TASK_EVENT:
         return {
            ...state,
            ...syncTaskScheduleInPage({
               tasks: state.tasks,
               payload
            }),
            loading: false,
            error: false
         }
      case DELETE_TASK:
         return {
            ...state,
            ...deleteTask({
               taskId: payload.taskId,
               taskMap: state.taskMap,
               tasks: state.tasks
            }),
            loading: false,
            error: false
         }
      case FILTER_SCHEDULE:
         return {
            ...state,
            ...updateFilterSchedule({
               currentFilter: state.filter,
               payload
            }),
            loading: false,
            error: false
         }
      case FILTER_NAME:
         return {
            ...state,
            ...updateFilterName({
               currentFilter: state.filter,
               payload
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

      case LOGOUT:
         return {
            ...initialState,
            loading: false
         }

      default:
         return state
   }
}

export default pageReducer
