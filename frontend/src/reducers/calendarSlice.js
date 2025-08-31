import { createSlice } from '@reduxjs/toolkit'

const calendarSlice = createSlice({
  name: 'calendar',
  initialState: {
    range: [],
    navigationTarget: null,
    currentEvent: null
  },
  reducers: {

  }
})

// export const {  } = calendarSlice.actions
export default calendarSlice.reducer