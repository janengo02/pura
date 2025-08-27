import { createSlice } from '@reduxjs/toolkit'

const taskSlice = createSlice({
  name: 'task',
  initialState: {
    currentTask: null,
    targetEventIndex: null,
    viewTargetEventAt: null
  },
  reducers: {
    showTask: (state, action) => {
      state.currentTask = action.payload
      state.targetEventIndex = action.payload.targetEventIndex || null
      state.viewTargetEventAt = action.payload.viewTargetEventAt || null
    },
    clearTask: (state) => {
      state.currentTask = null
      state.targetEventIndex = null
      state.viewTargetEventAt = null
    },
    setTargetEvent: (state, action) => {
      state.targetEventIndex = action.payload.targetEventIndex
      state.viewTargetEventAt = action.payload.viewTargetEventAt
    }
  }
})

export const { showTask, clearTask, setTargetEvent } = taskSlice.actions
export default taskSlice.reducer