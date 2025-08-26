import { createSlice } from '@reduxjs/toolkit'

const initialState = {
   isLoading: !!localStorage.getItem('token') // Only show loading if we have a token to validate
}

const loadingSlice = createSlice({
   name: 'loading',
   initialState,
   reducers: {
      startLoading: (state) => {
         state.isLoading = true
      },
      endLoading: (state) => {
         state.isLoading = false
      }
   }
})

// Export action creators
export const { startLoading, endLoading } = loadingSlice.actions

// Export utilities for backwards compatibility
export const setLoadingAction = {
   start: (dispatch) => dispatch(startLoading()),
   end: (dispatch) => dispatch(endLoading())
}

// Export reducer
export default loadingSlice.reducer