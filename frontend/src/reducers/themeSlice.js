import { createSlice } from '@reduxjs/toolkit'

const initialState = {
   current: 'light'
}

const themeSlice = createSlice({
   name: 'theme',
   initialState,
   reducers: {
      toggleTheme: (state) => {
         const newTheme = state.current === 'light' ? 'dark' : 'light'
         localStorage.setItem('chakra-ui-color-mode', newTheme)
         state.current = newTheme
      },
      setTheme: (state, action) => {
         const theme = action.payload
         localStorage.setItem('chakra-ui-color-mode', theme)
         state.current = theme
      },
      initializeTheme: (state, action) => {
         const theme = action.payload
         localStorage.setItem('chakra-ui-color-mode', theme)
         state.current = theme
      }
   }
})

// Export action creators
export const { toggleTheme, setTheme, initializeTheme } = themeSlice.actions

// Export thunk for initialization logic (only where async logic is needed)
export const initializeThemeAction = () => (dispatch) => {
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

   dispatch(initializeTheme(savedTheme))
}

// Export reducer
export default themeSlice.reducer