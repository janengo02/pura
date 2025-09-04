// =============================================================================
// GOOGLE AUTHENTICATION HELPERS
// =============================================================================

import { useGoogleLogin } from '@react-oauth/google'

/**
 * Create a reusable Google login hook with configurable options
 * @param {Object} options - Configuration options
 * @param {Function} options.onSuccess - Success callback function that receives (code, range)
 * @param {Function} options.onError - Error callback function that receives (error)
 * @param {string} options.range - Date range parameter for calendar sync
 * @param {string} options.scope - OAuth scope permissions (optional)
 * @param {boolean} options.autoSelect - Auto-select account if already logged in (optional)
 * @returns {Function} Google login function
 */
export const useGoogleAccountLogin = ({
   onSuccess,
   onError,
   range,
   scope = 'openid email profile https://www.googleapis.com/auth/calendar',
   autoSelect = true
}) => {
   const googleLogin = useGoogleLogin({
      onSuccess: (tokenResponse) => {
         const { code } = tokenResponse
         if (onSuccess) {
            onSuccess(code, range)
         }
      },
      onError: (responseError) => {
         if (onError) {
            onError(responseError)
         }
      },
      onNonOAuthError: (responseError) => {
         // Handle non-OAuth errors - can be customized in the future
         if (onError) {
            onError(responseError)
         }
      },
      scope,
      flow: 'auth-code',
      auto_select: autoSelect
   })

   return googleLogin
}