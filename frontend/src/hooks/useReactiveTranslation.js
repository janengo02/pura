// =============================================================================
// REACTIVE TRANSLATION HOOK
// =============================================================================

import { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

/**
 * Hook that ensures components re-render when language changes
 * Works with both Redux language state and direct t() imports
 */
export const useReactiveTranslation = () => {
   const { t, i18n } = useTranslation()
   const reduxLanguage = useSelector((state) => state.language?.current || 'en')
   const [, forceUpdate] = useState(0)

   useEffect(() => {
      // Sync i18n with Redux state
      if (i18n.language !== reduxLanguage) {
         i18n.changeLanguage(reduxLanguage)
      }
   }, [reduxLanguage, i18n])

   useEffect(() => {
      // Force re-render when language changes
      const handleLanguageChange = () => {
         forceUpdate((prev) => prev + 1)
      }

      // Listen to both i18n events and custom events
      i18n.on('languageChanged', handleLanguageChange)
      window.addEventListener('languageChanged', handleLanguageChange)
      window.addEventListener('i18nUpdate', handleLanguageChange)

      return () => {
         i18n.off('languageChanged', handleLanguageChange)
         window.removeEventListener('languageChanged', handleLanguageChange)
         window.removeEventListener('i18nUpdate', handleLanguageChange)
      }
   }, [i18n])

   return { t, i18n, currentLanguage: reduxLanguage }
}

/**
 * Simple hook that just returns a reactive t function
 * Use this for components that only need translation
 */
export const useT = () => {
   const { t } = useReactiveTranslation()
   return t
}
