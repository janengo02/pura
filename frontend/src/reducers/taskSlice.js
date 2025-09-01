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
  },
  extraReducers: (builder) => {
    // Handle RTK Query showTaskModal states
    builder
      .addMatcher(taskApi.endpoints.showTaskModal.matchFulfilled, (state, action) => {
        state.task = action.payload
      })
  }
})

// Export actions
export const {
  clearTask,
  optimisticDeleteTask,
  optimisticMoveTask
} = taskSlice.actions
export default taskSlice.reducer