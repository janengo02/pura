import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunks (modern naming practices)
export const initializeTheme = createAsyncThunk(
   'theme/initializeTheme',
   async () => {
      // Check for saved theme in localStorage (using Chakra's key)
      let savedTheme = localStorage.getItem('chakra-ui-color-mode')

      // If no saved theme, check system preference
      if (!savedTheme) {
         const prefersDark =
            window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: dark)').matches
         savedTheme = prefersDark ? 'dark' : 'light'
      }

      // Ensure theme is valid
      if (!['light', 'dark'].includes(savedTheme)) {
         savedTheme = 'light'
      }

      // Persist the determined theme
      localStorage.setItem('chakra-ui-color-mode', savedTheme)

      return savedTheme
   }
)

export const toggleTheme = createAsyncThunk(
   'theme/toggleTheme',
   async (_, { getState }) => {
      const currentTheme = getState().theme.current
      const newTheme = currentTheme === 'light' ? 'dark' : 'light'
      
      // Save to localStorage for persistence
      localStorage.setItem('chakra-ui-color-mode', newTheme)
      
      return newTheme
   }
)

export const setTheme = createAsyncThunk(
   'theme/setTheme',
   async (theme) => {
      // Ensure theme is valid
      const validTheme = ['light', 'dark'].includes(theme) ? theme : 'light'
      
      // Save to localStorage for persistence
      localStorage.setItem('chakra-ui-color-mode', validTheme)
      
      return validTheme
   }
)

const initialState = {
   current: 'light'
}

const themeSlice = createSlice({
   name: 'theme',
   initialState,
   reducers: {
      // Sync actions only (if needed for direct state updates)
   },
   extraReducers: (builder) => {
      builder
         .addCase(initializeTheme.fulfilled, (state, action) => {
            state.current = action.payload
         })
         .addCase(toggleTheme.fulfilled, (state, action) => {
            state.current = action.payload
         })
         .addCase(setTheme.fulfilled, (state, action) => {
            state.current = action.payload
         })
   }
})

// Export reducer
export default themeSlice.reducer