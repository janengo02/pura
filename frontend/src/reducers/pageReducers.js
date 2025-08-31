import {
   PAGE_ERROR,
   CREATE_TASK,
   UPDATE_TASK_BASIC,
   DELETE_TASK,
   CREATE_TASK_SCHEDULE,
   DELETE_TASK_SCHEDULE,
   UPDATE_TASK_SCHEDULE,
   SYNC_TASK_EVENT,
   LOGOUT
} from '../actions/types'

import {
   updateTask,
   addPageTaskScheduleSlot,
   removePageTaskScheduleSlot,
   updatePageTaskScheduleSlot,
   syncTaskScheduleInPage,
   getDefaultSchedule,
   getDefaultName,
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
