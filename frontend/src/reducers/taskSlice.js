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
  optimisticDeleteTask
} = taskSlice.actions
export default taskSlice.reducer