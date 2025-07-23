// =============================================================================
// EVENT UTILITY FUNCTIONS
// =============================================================================

/**
 * Generate consistent random color based on string hash
 * @param {string} str - String to hash
 * @returns {string} - Chakra UI color token
 */
export const getRandomColor = (str) => {
   let hash = 0
   for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
   }

   const colors = [
      'red.400',
      'orange.400', 
      'yellow.400',
      'green.400',
      'blue.400',
      'cyan.400',
      'pink.400'
   ]

   return colors[Math.abs(hash) % colors.length]
}

/**
 * Get attendee initials from name or email
 * @param {Object} attendee - Attendee object
 * @returns {string} - First initial
 */
export const getAttendeeInitials = (attendee) => {
   if (attendee.displayName) {
      return attendee.displayName.charAt(0).toUpperCase()
   }
   if (attendee.email) {
      return attendee.email.charAt(0).toUpperCase()
   }
   return '?'
}

/**
 * Get response badge color based on status
 * @param {string} status - Response status
 * @returns {string} - Chakra UI color token
 */
export const getResponseBadgeColor = (status) => {
   switch (status) {
      case 'accepted':
         return 'green.400'
      case 'declined':
         return 'red.400'
      case 'tentative':
         return 'gray.400'
      default:
         return 'gray.400'
   }
}

/**
 * Get response text translation key
 * @param {string} status - Response status
 * @param {Function} t - Translation function
 * @returns {string} - Translated text
 */
export const getResponseText = (status, t) => {
   switch (status) {
      case 'accepted':
         return t('attendee-accepted')
      case 'declined':
         return t('attendee-declined')
      case 'tentative':
         return t('attendee-tentative')
      default:
         return t('attendee-pending')
   }
}

/**
 * Calculate response statistics from attendees array
 * @param {Array} attendees - Array of attendee objects
 * @returns {Object} - Statistics object
 */
export const calculateResponseStats = (attendees) => {
   return attendees.reduce((stats, attendee) => {
      switch (attendee.responseStatus) {
         case 'accepted':
            stats.accepted++
            break
         case 'declined':
            stats.declined++
            break
         case 'tentative':
            stats.tentative++
            break
         default:
            stats.awaiting++
            break
      }
      return stats
   }, { accepted: 0, declined: 0, tentative: 0, awaiting: 0 })
}