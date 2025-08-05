// =============================================================================
// EVENT UTILITY FUNCTIONS
// =============================================================================

import moment from 'moment'
import { momentLocalizer } from 'react-big-calendar'

// Language-specific moment locale configurations
export const LOCALE_CONFIGS = {
   ja: {
      week: { dow: 1 }, // Monday first
      weekdays: [
         '日曜日',
         '月曜日',
         '火曜日',
         '水曜日',
         '木曜日',
         '金曜日',
         '土曜日'
      ],
      weekdaysShort: ['日', '月', '火', '水', '木', '金', '土'],
      weekdaysMin: ['日', '月', '火', '水', '木', '金', '土'],
      months: [
         '1月',
         '2月',
         '3月',
         '4月',
         '5月',
         '6月',
         '7月',
         '8月',
         '9月',
         '10月',
         '11月',
         '12月'
      ],
      monthsShort: [
         '1月',
         '2月',
         '3月',
         '4月',
         '5月',
         '6月',
         '7月',
         '8月',
         '9月',
         '10月',
         '11月',
         '12月'
      ],
      longDateFormat: {
         LT: 'HH:mm',
         LTS: 'HH:mm:ss',
         L: 'YYYY/MM/DD',
         LL: 'YYYY年M月D日',
         LLL: 'YYYY年M月D日 HH:mm',
         LLLL: 'YYYY年M月D日dddd HH:mm',
         l: 'YYYY/MM/DD',
         ll: 'YYYY年M月D日',
         lll: 'YYYY年M月D日 HH:mm',
         llll: 'YYYY年M月D日(ddd) HH:mm'
      },
      formats: {
         monthHeaderFormat: 'YYYY年M月',
         dayHeaderFormat: 'M月D日(ddd)',
         weekFormat: 'M月D日',
         agendaHeaderFormat: 'YYYY年M月D日'
      }
   },
   en: {
      week: { dow: 0 }, // Sunday first
      formats: {
         monthHeaderFormat: 'MMMM YYYY',
         dayHeaderFormat: 'dddd, MMMM D',
         weekFormat: 'MMMM D',
         agendaHeaderFormat: 'MMMM D, YYYY'
      }
   }
}

/**
 * Configure moment locale based on current language
 * @param {string} currentLanguage - Current application language
 * @returns {object} Configured moment localizer
 */
export const createLocalizedLocalizer = (currentLanguage) => {
   const config = LOCALE_CONFIGS[currentLanguage] || LOCALE_CONFIGS.en

   // Set moment global locale first with full configuration
   moment.locale(currentLanguage, config)

   // Force moment to use the new locale globally
   moment.locale(currentLanguage)

   // Create a fresh localizer instance with the configured moment
   const localizer = momentLocalizer(moment)

   // Override localizer formats for Japanese to ensure proper display
   if (currentLanguage === 'ja') {
      // Override the localizer's format methods to ensure Japanese display
      const originalFormat = localizer.format
      localizer.format = (value, format, culture) => {
         // Ensure moment is using Japanese locale for this format call
         const previousLocale = moment.locale()
         moment.locale('ja')
         const result = originalFormat.call(localizer, value, format, culture)
         moment.locale(previousLocale)
         return result
      }

      localizer.formats = {
         ...localizer.formats,
         monthHeaderFormat: 'YYYY年M月',
         dayHeaderFormat: 'M月D日(ddd)',
         weekHeaderFormat: 'M月D日',
         dayFormat: 'D (ddd)',
         weekdayFormat: 'dd',
         timeGutterFormat: 'HH:mm',
         eventTimeRangeFormat: ({ start, end }) => {
            return `${moment(start).locale('ja').format('HH:mm')} - ${moment(
               end
            )
               .locale('ja')
               .format('HH:mm')}`
         },
         agendaTimeFormat: 'HH:mm',
         agendaTimeRangeFormat: ({ start, end }) => {
            return `${moment(start).locale('ja').format('HH:mm')} - ${moment(
               end
            )
               .locale('ja')
               .format('HH:mm')}`
         }
      }
   }

   return localizer
}
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
   return attendees.reduce(
      (stats, attendee) => {
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
      },
      { accepted: 0, declined: 0, tentative: 0, awaiting: 0 }
   )
}
// Language-specific datetime format configurations
export const DATE_TIME_FORMATS = {
   ja: {
      sameDay: {
         dateFormat: 'M月D日(ddd)',
         timeFormat: 'HH:mm',
         dateTimeFormat: 'M月D日(ddd) HH:mm'
      },
      multiDay: {
         dateFormat: 'M月D日',
         timeFormat: 'HH:mm',
         dateTimeFormat: 'M月D日 HH:mm'
      },
      weekdays: {
         Sunday: '日',
         Monday: '月',
         Tuesday: '火',
         Wednesday: '水',
         Thursday: '木',
         Friday: '金',
         Saturday: '土'
      }
   },
   en: {
      sameDay: {
         dateFormat: 'dddd, MMMM D',
         timeFormat: 'h:mm A',
         dateTimeFormat: 'dddd, MMMM D h:mm A'
      },
      multiDay: {
         dateFormat: 'MMMM D',
         timeFormat: 'h:mm A',
         dateTimeFormat: 'MMMM D h:mm A'
      }
   }
}

/**
 * Convert string or date to moment object with proper locale
 * @param {string|Date} dateValue - Date value to convert
 * @param {string} language - Current language
 * @returns {moment.Moment} Moment object with locale set
 */
export const createMomentWithLocale = (dateValue, language) => {
   return moment(dateValue).locale(language)
}

/**
 * Format Japanese date with proper weekday
 * @param {moment.Moment} momentDate - Moment date object
 * @param {string} format - Base format string
 * @returns {string} Formatted date string
 */
export const formatJapaneseDate = (momentDate, format) => {
   const weekdays = DATE_TIME_FORMATS.ja.weekdays
   const englishWeekday = momentDate.format('dddd')
   const japaneseWeekday = weekdays[englishWeekday] || '日'

   // Replace (ddd) with Japanese weekday
   return format.includes('(ddd)')
      ? momentDate.format(format.replace('(ddd)', `(${japaneseWeekday})`))
      : momentDate.format(format)
}

/**
 * Convert Date object to datetime-local input format (YYYY-MM-DDTHH:MM)
 * @param {Date} date - Date object to convert
 * @returns {string} Formatted datetime string for datetime-local input
 */
export const toDateTimeLocalFormat = (date) => {
   const year = date.getFullYear()
   const month = String(date.getMonth() + 1).padStart(2, '0')
   const day = String(date.getDate()).padStart(2, '0')
   const hours = String(date.getHours()).padStart(2, '0')
   const minutes = String(date.getMinutes()).padStart(2, '0')

   return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Language-aware event time formatting
 * @param {string|Date} start - Event start time
 * @param {string|Date} end - Event end time
 * @param {string} currentLanguage - Current application language
 * @returns {string} Formatted time string
 */
export const formatEventTime = (start, end, currentLanguage = 'en') => {
   const formats = DATE_TIME_FORMATS[currentLanguage] || DATE_TIME_FORMATS.en

   const startMoment = createMomentWithLocale(start, currentLanguage)
   const endMoment = createMomentWithLocale(end, currentLanguage)

   // Check if it's the same day
   const isSameDay =
      startMoment.format('YYYY-MM-DD') === endMoment.format('YYYY-MM-DD')

   if (isSameDay) {
      // Same day event - show date once with time range
      if (currentLanguage === 'ja') {
         const dateStr = formatJapaneseDate(
            startMoment,
            formats.sameDay.dateFormat
         )
         const startTime = startMoment.format(formats.sameDay.timeFormat)
         const endTime = endMoment.format(formats.sameDay.timeFormat)
         return `${dateStr} ${startTime} - ${endTime}`
      } else {
         const dateStr = startMoment.format(formats.sameDay.dateFormat)
         const startTime = startMoment.format(formats.sameDay.timeFormat)
         const endTime = endMoment.format(formats.sameDay.timeFormat)
         return `${dateStr} ${startTime} - ${endTime}`
      }
   } else {
      // Multi-day event - show full date and time for both
      if (currentLanguage === 'ja') {
         const startStr = formatJapaneseDate(
            startMoment,
            formats.multiDay.dateTimeFormat
         )
         const endStr = formatJapaneseDate(
            endMoment,
            formats.multiDay.dateTimeFormat
         )
         return `${startStr} - ${endStr}`
      } else {
         const startStr = startMoment.format(formats.multiDay.dateTimeFormat)
         const endStr = endMoment.format(formats.multiDay.dateTimeFormat)
         return `${startStr} - ${endStr}`
      }
   }
}
