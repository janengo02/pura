// =============================================================================
// TASK REDUCER
// =============================================================================

import {
   SHOW_TASK,
   CLEAR_TASK,
   UPDATE_TASK,
   UPDATE_TASK_SCHEDULE,
   REMOVE_TASK_SCHEDULE_SLOT,
   MOVE_TASK
} from '../actions/types'

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

      case UPDATE_TASK:
         return {
            ...state,
            task:
               state.task && state.task._id === payload.task_id
                  ? {
                       ...state.task,
                       title:
                          payload.title !== undefined
                             ? payload.title
                             : state.task.title,
                       content:
                          payload.content !== undefined
                             ? payload.content
                             : state.task.content,
                       update_date:
                          payload.update_date || state.task.update_date
                    }
                  : state.task
         }

      case UPDATE_TASK_SCHEDULE:
         return {
            ...state,
            task:
               state.task && state.task._id === payload.task_id
                  ? {
                       ...state.task,
                       schedule: state.task.schedule?.map((slot, index) =>
                          index === payload.slot_index
                             ? {
                                  ...slot,
                                  start: payload.start || slot.start,
                                  end: payload.end || slot.end
                               }
                             : slot
                       ),
                       target_event_index: payload.target_event_index,
                       update_date:
                          payload.update_date || state.task.update_date
                    }
                  : state.task
         }

      case REMOVE_TASK_SCHEDULE_SLOT:
         return {
            ...state,
            task:
               state.task && state.task._id === payload.task_id
                  ? {
                       ...state.task,
                       schedule: state.task.schedule?.filter(
                          (slot, index) => index !== payload.slot_index
                       ),
                       update_date:
                          payload.update_date || state.task.update_date
                    }
                  : state.task
         }

      case MOVE_TASK:
         return {
            ...state,
            task:
               state.task && state.task._id === payload.task_id
                  ? {
                       ...state.task,
                       ...(payload.group && { group: payload.group }),
                       ...(payload.progress && { progress: payload.progress }),
                       update_date:
                          payload.update_date || state.task.update_date
                    }
                  : state.task
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
