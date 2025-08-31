import { createSlice } from '@reduxjs/toolkit'
import { taskApi } from '../api/taskApi'

const taskSlice = createSlice({
  name: 'taskSlice', // Changed to avoid conflicts with legacy task reducer
  initialState: {
    // Maintain compatibility with legacy structure
    task: null
  },
  reducers: {
    clearTask: (state) => {
      console.log('Clearing task')
      state.task = null
    },
    updateTaskBasic: (state, action) => {
      if (state.task && state.task.id === action.payload.taskId) {
        state.task = {
          ...state.task,
          title: action.payload.title !== undefined ? action.payload.title : state.task.title,
          content: action.payload.content !== undefined ? action.payload.content : state.task.content,
          updateDate: action.payload.updateDate || state.task.updateDate
        }
      }
    },
    updateTaskSchedule: (state, action) => {
      if (state.task && state.task.id === action.payload.taskId) {
        state.task = {
          ...state.task,
          schedule: state.task.schedule?.map((slot, index) =>
            index === action.payload.slotIndex
              ? {
                  ...slot,
                  start: action.payload.start || slot.start,
                  end: action.payload.end || slot.end,
                  googleEventStart: action.payload.googleEventStart || slot.googleEventStart,
                  googleEventEnd: action.payload.googleEventEnd || slot.googleEventEnd,
                  syncStatus: action.payload.syncStatus || slot.syncStatus
                }
              : slot
          ),
          targetEventIndex: action.payload.targetEventIndex,
          viewTargetEventAt: action.payload.viewTargetEventAt || state.task.viewTargetEventAt,
          updateDate: action.payload.updateDate || state.task.updateDate
        }
      }
    },
    createTaskSchedule: (state, action) => {
      if (state.task && state.task.id === action.payload.taskId) {
        state.task = {
          ...state.task,
          schedule: [...(state.task.schedule || []), action.payload.newSlot],
          updateDate: action.payload.updateDate || state.task.updateDate
        }
      }
    },
    syncTaskEvent: (state, action) => {
      if (state.task && state.task.id === action.payload.taskId) {
        state.task = {
          ...state.task,
          schedule: state.task.schedule?.map((slot, index) =>
            index === action.payload.slotIndex
              ? {
                  ...slot,
                  googleEventId: action.payload.googleEventId,
                  googleCalendarId: action.payload.calendarId,
                  googleAccountEmail: action.payload.accountEmail,
                  syncStatus: action.payload.syncStatus || '0'
                }
              : slot
          ),
          updateDate: action.payload.updateDate || state.task.updateDate
        }
      }
    },
    deleteTaskSchedule: (state, action) => {
      if (state.task && state.task.id === action.payload.taskId) {
        state.task = {
          ...state.task,
          schedule: state.task.schedule?.filter((slot, index) => index !== action.payload.slotIndex),
          targetEventIndex: null,
          updateDate: action.payload.updateDate || state.task.updateDate
        }
      }
    },
    moveTask: (state, action) => {
      if (state.task && state.task.id === action.payload.taskId) {
        state.task = {
          ...state.task,
          ...(action.payload.group && { group: action.payload.group }),
          ...(action.payload.progress && { progress: action.payload.progress }),
          updateDate: action.payload.updateDate || state.task.updateDate
        }
      }
    },
    deleteTask: (state) => {
      state.task = null
    },
    setTargetEvent: (state, action) => {
      if (state.task) {
        state.task.targetEventIndex = action.payload.targetEventIndex
        state.task.viewTargetEventAt = action.payload.viewTargetEventAt
      }
    }
  },
  extraReducers: (builder) => {
    // Handle RTK Query showTaskModal states
    builder
      .addMatcher(taskApi.endpoints.showTaskModal.matchFulfilled, (state, action) => {
        state.task = action.payload
      })
      .addMatcher(taskApi.endpoints.getTask.matchFulfilled, (state, action) => {
        state.task = action.payload
      })
  }
})

// Export actions
export const {
  clearTask,
  updateTaskBasic,
  updateTaskSchedule,
  createTaskSchedule,
  syncTaskEvent,
  deleteTaskSchedule,
  moveTask,
  deleteTask,
  setTargetEvent
} = taskSlice.actions
export default taskSlice.reducer