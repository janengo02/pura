import { createSlice } from '@reduxjs/toolkit'

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    range: [],
    navigationTarget: null,
    currentEvent: null
  },
  reducers: {
    setCalendarRange: (state, action) => {
      state.range = action.payload
    },
    navigateToDate: (state, action) => {
      state.navigationTarget = action.payload
    },
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload
    },
    clearCurrentEvent: (state) => {
      state.currentEvent = null
    }
  }
})

export const { setCalendarRange, navigateToDate, setCurrentEvent, clearCurrentEvent } = calendarSlice.actions
export default calendarSlice.reducer