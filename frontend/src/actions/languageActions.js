// =============================================================================
// LANGUAGE ACTIONS
// =============================================================================

import { CHANGE_LANGUAGE, LANGUAGE_ERROR } from './types'

// =============================================================================
// ACTION CREATORS
// =============================================================================

/**
 * Change application language with immediate i18n integration
 * @param {string} language - Language code ('en', 'ja')
 */
export const changeLanguageAction = (language) => async (dispatch) => {
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

      // Dispatch Redux action (this will trigger component re-renders)
      dispatch({
         type: CHANGE_LANGUAGE,
         payload: language
      })

      // Small delay to ensure i18n has fully updated
      setTimeout(() => {
         // Trigger additional re-render for any stubborn components
         window.dispatchEvent(
            new CustomEvent('languageChanged', {
               detail: { language }
            })
         )
      }, 10)
   } catch (error) {
      // Dispatch error action
      dispatch({
         type: LANGUAGE_ERROR,
         payload: error.message
      })
   }
}

/**
 * Initialize language from localStorage or browser settings
 */
export const initializeLanguageAction = () => async (dispatch) => {
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

      // Dispatch initialization
      dispatch({
         type: CHANGE_LANGUAGE,
         payload: initialLanguage
      })
   } catch (error) {
      // Fallback to English
      dispatch({
         type: CHANGE_LANGUAGE,
         payload: 'en'
      })
   }
}
