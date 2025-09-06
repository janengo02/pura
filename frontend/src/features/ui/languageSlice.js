import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { i18n } from '../../lang/i18n'

// Async thunks (modern naming practices)
export const changeLanguage = createAsyncThunk(
   'language/changeLanguage',
   async (language, { rejectWithValue }) => {
      try {
         console.log('Changing language to:', language)

         // Change i18n language immediately
         await i18n.changeLanguage(language)

         // Persist to localStorage
         localStorage.setItem('preferredLanguage', language)

         // Update document language for accessibility
         document.documentElement.lang = language

         // Force re-render of all i18n components by updating i18n internal state
         i18n.emit('languageChanged', language)

         return language
      } catch (error) {
         console.log('Error changing language:', error)
         return rejectWithValue(error.message)
      }
   }
)

export const initializeLanguage = createAsyncThunk(
   'language/initializeLanguage',
   async (_, { rejectWithValue }) => {
      try {
         const supportedLanguages = ['en', 'ja']
         let initialLanguage = 'en' // fallback

         // Check localStorage first
         const savedLanguage = localStorage.getItem('preferredLanguage')
         if (savedLanguage && supportedLanguages.includes(savedLanguage)) {
            initialLanguage = savedLanguage
         } else {
            // Check browser language
            const browserLanguage = navigator.language.split('-')[0]
            if (supportedLanguages.includes(browserLanguage)) {
               initialLanguage = browserLanguage
            }
         }

         // Initialize i18n with detected language
         await i18n.changeLanguage(initialLanguage)

         // Update document language
         document.documentElement.lang = initialLanguage

         return initialLanguage
      } catch (error) {
         return rejectWithValue(error.message)
      }
   }
)

const initialState = {
   current: 'en',
   error: null,
   isChanging: false
}

const languageSlice = createSlice({
   name: 'language',
   initialState,
   reducers: {
      // Sync actions only (if needed)
   },
   extraReducers: (builder) => {
      builder
         // Change language
         .addCase(changeLanguage.pending, (state) => {
            state.isChanging = true
            state.error = null
         })
         .addCase(changeLanguage.fulfilled, (state, action) => {
            state.current = action.payload
            state.isChanging = false
            state.error = null
         })
         .addCase(changeLanguage.rejected, (state, action) => {
            state.isChanging = false
            state.error = action.payload
         })
         // Initialize language
         .addCase(initializeLanguage.fulfilled, (state, action) => {
            state.current = action.payload
            state.error = null
         })
   }
})

// Export reducer
export default languageSlice.reducer