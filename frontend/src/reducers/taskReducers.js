// =============================================================================
// TASK REDUCER
// =============================================================================

import {
   SHOW_TASK,
   CLEAR_TASK,
   UPDATE_TASK_BASIC,
   UPDATE_TASK_SCHEDULE,
   CREATE_TASK_SCHEDULE,
   SYNC_TASK_EVENT,
   DELETE_TASK_SCHEDULE,
   MOVE_TASK,
   DELETE_TASK,
   LOGOUT
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

      case UPDATE_TASK_BASIC:
         return {
            ...state,
            task:
               state.task && state.task.id === payload.taskId
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
                       updateDate: payload.updateDate || state.task.updateDate
                    }
                  : state.task
         }

      case UPDATE_TASK_SCHEDULE:
         return {
            ...state,
            task:
               state.task && state.task.id === payload.taskId
                  ? {
                       ...state.task,
                       schedule: state.task.schedule?.map((slot, index) =>
                          index === payload.slotIndex
                             ? {
                                  ...slot,
                                  start: payload.start || slot.start,
                                  end: payload.end || slot.end,
                                  googleEventStart:
                                     payload.googleEventStart ||
                                     slot.googleEventStart,
                                  googleEventEnd:
                                     payload.googleEventEnd ||
                                     slot.googleEventEnd,
                                  syncStatus:
                                     payload.syncStatus || slot.syncStatus
                               }
                             : slot
                       ),
                       targetEventIndex: payload.targetEventIndex,
                       viewTargetEventAt:
                          payload.viewTargetEventAt ||
                          state.task.viewTargetEventAt,
                       updateDate: payload.updateDate || state.task.updateDate
                    }
                  : state.task
         }

      case CREATE_TASK_SCHEDULE:
         return {
            ...state,
            task:
               state.task && state.task.id === payload.taskId
                  ? {
                       ...state.task,
                       schedule: [
                          ...(state.task.schedule || []),
                          payload.newSlot
                       ],
                       updateDate: payload.updateDate || state.task.updateDate
                    }
                  : state.task
         }

      case SYNC_TASK_EVENT:
         return {
            ...state,
            task:
               state.task && state.task.id === payload.taskId
                  ? {
                       ...state.task,
                       schedule: state.task.schedule?.map((slot, index) =>
                          index === payload.slotIndex
                             ? {
                                  ...slot,
                                  googleEventId: payload.googleEventId,
                                  googleCalendarId: payload.calendar_id,
                                  googleAccountEmail: payload.accountEmail,
                                  syncStatus: payload.syncStatus || '0'
                               }
                             : slot
                       ),
                       updateDate: payload.updateDate || state.task.updateDate
                    }
                  : state.task
         }

      case DELETE_TASK_SCHEDULE:
         return {
            ...state,
            task:
               state.task && state.task.id === payload.taskId
                  ? {
                       ...state.task,
                       schedule: state.task.schedule?.filter(
                          (slot, index) => index !== payload.slotIndex
                       ),
                       targetEventIndex: null,
                       updateDate: payload.updateDate || state.task.updateDate
                    }
                  : state.task
         }

      case MOVE_TASK:
         return {
            ...state,
            task:
               state.task && state.task.id === payload.taskId
                  ? {
                       ...state.task,
                       ...(payload.group && { group: payload.group }),
                       ...(payload.progress && { progress: payload.progress }),
                       updateDate: payload.updateDate || state.task.updateDate
                    }
                  : state.task
         }

      case CLEAR_TASK:
      case DELETE_TASK:
         return {
            ...state,
            task: null
         }

      case LOGOUT:
         return {
            ...initialState
         }

      default:
         return state
   }
}

export default taskReducer
