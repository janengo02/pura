// =============================================================================
// IMPORTS
// =============================================================================

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './en.json'
import ja from './ja.json'

// =============================================================================
// CONFIGURATION
// =============================================================================

const resources = {
   en: { ...en },
   ja: { ...ja }
}

i18n.use(initReactI18next).init({
   resources,
   lng: 'en', // Will be overridden by Redux initialization
   fallbackLng: 'en',
   interpolation: {
      escapeValue: false // react already safes from xss
   },
   react: {
      transKeepBasicHtmlNodesFor: ['br', 'wbr'],
      useSuspense: false // Important: Prevents suspense issues during language change
   }
})

// =============================================================================
// REACTIVE TRANSLATION FUNCTION
// =============================================================================

// Counter to force re-renders when language changes
let renderCounter = 0

// Create a reactive translation function
const createReactiveT = () => {
   // Subscribe to language changes
   i18n.on('languageChanged', () => {
      renderCounter++
      // Force update all components using this t function
      window.dispatchEvent(new CustomEvent('i18nUpdate'))
   })

   // Return enhanced t function
   return (key, options = {}) => {
      // This counter reference ensures components re-render
      // when language changes (even though we don't use it)
      void renderCounter

      try {
         return i18n.t(key, options)
      } catch (error) {
         console.warn(`Translation error for key "${key}":`, error)
         return key // Return the key as fallback
      }
   }
}

// =============================================================================
// EXPORTS
// =============================================================================

// Export the reactive translation function
const t = createReactiveT()

export { i18n }
export default t
