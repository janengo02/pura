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
      state.task = null
    },
    optimisticDeleteTask: (state, action) => {
      // Clear the task immediately for optimistic update
      state.task = null
    },
    optimisticMoveTask: (state, action) => {
      // Update the task group/progress immediately for optimistic update
      if (state.task && state.task.id === action.payload.taskId) {
        state.task = {
          ...state.task,
          ...(action.payload.group && { group: action.payload.group }),
          ...(action.payload.progress && { progress: action.payload.progress }),
          updateDate: action.payload.updateDate || state.task.updateDate
        }
      }
    },
    optimisticAddScheduleSlot: (state, action) => {
      // Add schedule slot immediately for optimistic update
      if (state.task && state.task.id === action.payload.taskId) {
        state.task = {
          ...state.task,
          schedule: [
            ...(state.task.schedule || []),
            action.payload.newSlot
          ],
          updateDate: action.payload.updateDate || state.task.updateDate
        }
      }
    },
  },
  extraReducers: (builder) => {
    // Handle RTK Query showTaskModal states
    builder
      .addMatcher(taskApi.endpoints.showTaskModal.matchFulfilled, (state, action) => {
        state.task = action.payload
      })
      .addMatcher(taskApi.endpoints.syncTaskWithGoogle.matchFulfilled, (state, action) => {
        // Update task sync status in task state
        const { slotIndex, calendarId, accountEmail } = action.meta.arg.originalArgs
        const { task: newTask, event: newEvent } = action.payload

        state.task = {
          ...state.task,
          schedule: state.task.schedule?.map((slot, index) =>
            index === slotIndex
              ? {
                  ...slot,
                  googleEventId: newEvent.id,
                  googleCalendarId: calendarId,
                  googleAccountEmail: accountEmail,
                  syncStatus: newTask.schedule?.[slotIndex]?.syncStatus || '0'
                }
              : slot
          ),
          updateDate: newTask.updateDate || new Date().toISOString()
        }
      })
  }
})

// Export actions
export const {
  clearTask,
  optimisticDeleteTask,
  optimisticMoveTask,
  optimisticAddScheduleSlot,
} = taskSlice.actions
export default taskSlice.reducer