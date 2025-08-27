import { createSlice } from '@reduxjs/toolkit'
import { pageApi } from '../api/pageApi'

const pageSlice = createSlice({
  name: 'page',
  initialState: {
    currentPageId: null,
    filter: {
      schedule: 'all',
      name: ''
    },
    error: null
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPageId = action.payload
      state.error = null
    },
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
    // Handle page loading states
    builder
      .addMatcher(pageApi.endpoints.getPage.matchFulfilled, (state, action) => {
        state.currentPageId = action.meta.arg.originalArgs
        state.error = null
      })
      .addMatcher(pageApi.endpoints.getPage.matchRejected, (state, action) => {
        state.error = action.error
      })
  }
})

export const { setCurrentPage, updateFilter, setPageError, clearPageError } = pageSlice.actions
export default pageSlice.reducer