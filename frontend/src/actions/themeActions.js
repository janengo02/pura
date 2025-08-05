import { TOGGLE_THEME, SET_THEME, INITIALIZE_THEME } from './types'

/**
 * Toggle between light and dark theme
 * @returns {Function} Redux thunk
 */
export const toggleThemeAction = () => (dispatch, getState) => {
   const currentTheme = getState().theme.current
   const newTheme = currentTheme === 'light' ? 'dark' : 'light'

   // Save to localStorage for persistence
   localStorage.setItem('chakra-ui-color-mode', newTheme)

   dispatch({
      type: TOGGLE_THEME,
      payload: newTheme
   })
}

/**
 * Set specific theme
 * @param {string} theme - Theme name ('light' or 'dark')
 * @returns {Function} Redux thunk
 */
export const setThemeAction = (theme) => (dispatch) => {
   // Save to localStorage for persistence
   localStorage.setItem('chakra-ui-color-mode', theme)

   dispatch({
      type: SET_THEME,
      payload: theme
   })
}

/**
 * Initialize theme on app start
 * @returns {Function} Redux thunk
 */
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

   // Save to localStorage for persistence
   localStorage.setItem('chakra-ui-color-mode', savedTheme)

   dispatch({
      type: INITIALIZE_THEME,
      payload: savedTheme
   })
}
