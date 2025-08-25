import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

// Async thunks (modern naming practices)
export const changeLanguage = createAsyncThunk(
   'language/changeLanguage',
   async (language, { rejectWithValue }) => {
      try {
         // Import i18n dynamically to avoid circular dependencies
         const { i18n } = await import('../lang/i18n')

         // Change i18n language immediately
         await i18n.changeLanguage(language)

         // Persist to localStorage
         localStorage.setItem('preferredLanguage', language)

         // Update document language for accessibility
         document.documentElement.lang = language

         // Force re-render of all i18n components by updating i18n internal state
         i18n.emit('languageChanged', language)

         // // Small delay to ensure i18n has fully updated
         // setTimeout(() => {
         //    // Trigger additional re-render for any stubborn components
         //    window.dispatchEvent(
         //       new CustomEvent('languageChanged', {
         //          detail: { language }
         //       })
         //    )
         // }, 10)

         return language
      } catch (error) {
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

         // Import i18n dynamically
         const { i18n } = await import('../lang/i18n')

         // Initialize i18n with detected language
         await i18n.changeLanguage(initialLanguage)

         // Update document language
         document.documentElement.lang = initialLanguage

         return initialLanguage
      } catch (error) {
         // Fallback to English on error
         return 'en'
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