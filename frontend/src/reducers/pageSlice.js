import { createSlice } from '@reduxjs/toolkit'
import { pageApi } from '../api/pageApi'
import { getDefaultName, getDefaultSchedule } from './pageReducersHelpers'

const pageSlice = createSlice({
  name: 'pageSlice', // Different name to avoid conflicts with pageReducers
  initialState: {
    // RTK Query data structure
    id: null,
    groupOrder: [],
    progressOrder: [],
    taskMap: [],
    tasks: [],
    title: null,
    user: null,
    // Additional pageSlice specific state
    filter: {
          schedule: getDefaultSchedule(),
          name: getDefaultName()
       },
  },
  reducers: {
    updateFilter: (state, action) => {
      state.filter = { ...state.filter, ...action.payload }
    },
    setPageError: (state, action) => {
      state.error = action.payload
    },
    clearPageError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    // Handle RTK Query getFirstPage states
    builder
      .addMatcher(pageApi.endpoints.getFirstPage.matchFulfilled, (state, action) => {
        // Map RTK Query response to pageSlice state
        const pageData = action.payload
        state.id = pageData.id
        state.groupOrder = pageData.groupOrder || []
        state.progressOrder = pageData.progressOrder || []
        state.taskMap = pageData.taskMap || []
        state.tasks = pageData.tasks || []
        state.title = pageData.title
        state.user = pageData.user
      })
  }
})

export const { updateFilter, setPageError, clearPageError } = pageSlice.actions
export default pageSlice.reducer