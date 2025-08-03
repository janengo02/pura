// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// External Libraries
import moment from 'moment'
import 'moment/locale/ja'

// UI Components
import { Box, Flex, HStack, Input, Text } from '@chakra-ui/react'

// Utils & Hooks
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// =============================================================================
// CONSTANTS
// =============================================================================

const TEXT_STYLES = {
   fontSize: 'md',
   mb: 2,
   ml: 7
}

// Language-specific datetime format configurations
const DATE_TIME_FORMATS = {
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

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Convert string or date to moment object with proper locale
 * @param {string|Date} dateValue - Date value to convert
 * @param {string} language - Current language
 * @returns {moment.Moment} Moment object with locale set
 */
const createMomentWithLocale = (dateValue, language) => {
   return moment(dateValue).locale(language)
}

/**
 * Format Japanese date with proper weekday
 * @param {moment.Moment} momentDate - Moment date object
 * @param {string} format - Base format string
 * @returns {string} Formatted date string
 */
const formatJapaneseDate = (momentDate, format) => {
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
const toDateTimeLocalFormat = (date) => {
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
const formatEventTime = (start, end, currentLanguage = 'en') => {
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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EventTimeText = React.memo(({ start, end }) => {
   // -------------------------------------------------------------------------
   // HOOKS
   // -------------------------------------------------------------------------

   const { currentLanguage } = useReactiveTranslation()

   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------

   const eventTimeString = useMemo(
      () => formatEventTime(start, end, currentLanguage || 'en'),
      [start, end, currentLanguage]
   )

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return <Text {...TEXT_STYLES}>{eventTimeString}</Text>
})

const EventTimeInput = React.memo(
   ({ startTime, setStartTime, endTime, setEndTime }) => {
      const { t } = useReactiveTranslation()
      const handleStartTimeChange = useCallback(
         (e) => {
            e.preventDefault()

            // Handle empty or invalid input
            if (!e.target.value) {
               return
            }

            const newStartTime = new Date(e.target.value)

            // Validate that the input is a valid date
            if (isNaN(newStartTime.getTime())) {
               return
            }

            newStartTime.setSeconds(0, 0) // Set seconds and milliseconds to 0

            const currentEndTime = new Date(endTime)

            // Additional validation for end time
            if (isNaN(currentEndTime.getTime())) {
               setStartTime(e.target.value)
               return
            }

            // Validate: if new start time is equal or later than end time
            if (newStartTime >= currentEndTime) {
               // Auto-correct: set end time to 1 hour after new start time
               const correctedEndTime = new Date(
                  newStartTime.getTime() + 60 * 60 * 1000
               ) // Add 1 hour in milliseconds

               // Update both start and end times
               setStartTime(e.target.value)
               setEndTime(toDateTimeLocalFormat(correctedEndTime))
            } else {
               // Only update start time
               setStartTime(e.target.value)
            }
         },
         [setStartTime, setEndTime, endTime]
      )

      const handleEndTimeChange = useCallback(
         (e) => {
            e.preventDefault()

            // Handle empty or invalid input
            if (!e.target.value) {
               return
            }

            const newEndTime = new Date(e.target.value)

            // Validate that the input is a valid date
            if (isNaN(newEndTime.getTime())) {
               return
            }

            newEndTime.setSeconds(0, 0) // Set seconds and milliseconds to 0

            const currentStartTime = new Date(startTime)

            // Additional validation for start time
            if (isNaN(currentStartTime.getTime())) {
               setEndTime(e.target.value)
               return
            }

            // Validate: if new end time is equal or earlier than start time
            if (newEndTime <= currentStartTime) {
               // Auto-correct: set start time to 1 hour before new end time
               const correctedStartTime = new Date(
                  newEndTime.getTime() - 60 * 60 * 1000
               ) // Subtract 1 hour in milliseconds

               // Update both start and end times
               setStartTime(toDateTimeLocalFormat(correctedStartTime))
               setEndTime(e.target.value)
            } else {
               // Only update end time
               setEndTime(e.target.value)
            }
         },
         [setStartTime, setEndTime, startTime]
      )

      const timeInputProps = useMemo(
         () => ({
            size: 'md',
            type: 'datetime-local',
            variant: 'filled',
            width: 'auto',
            borderRadius: 'md',
            bg: 'bg.canvas'
         }),
         []
      )
      const startTimeInput = useMemo(
         () => (
            <Input
               {...timeInputProps}
               value={startTime}
               onChange={handleStartTimeChange}
            />
         ),
         [startTime, handleStartTimeChange, timeInputProps]
      )
      const isTimeValid = useMemo(() => {
         if (!startTime || !endTime) return false
         const start = new Date(startTime)
         const end = new Date(endTime)
         return start < end && !isNaN(start.getTime()) && !isNaN(end.getTime())
      }, [startTime, endTime])

      const endTimeInput = useMemo(
         () => (
            <Input
               {...timeInputProps}
               value={endTime}
               onChange={handleEndTimeChange}
            />
         ),
         [endTime, handleEndTimeChange, timeInputProps]
      )

      return (
         <Flex
            w='full'
            alignItems='center'
            gap={2}
            pl={7}
            color={!isTimeValid ? 'danger.secondary' : undefined}
         >
            {startTimeInput} - {endTimeInput} {t('timezone-jst')}
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
EventTimeText.displayName = 'EventTimeText'
EventTimeInput.displayName = 'EventTimeInput'

// PropTypes validation
EventTimeText.propTypes = {
   start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
      .isRequired,
   end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
      .isRequired
}
EventTimeInput.propTypes = {
   startTime: PropTypes.string.isRequired,
   setStartTime: PropTypes.func.isRequired,
   endTime: PropTypes.string.isRequired,
   setEndTime: PropTypes.func.isRequired
}

// =============================================================================
// EXPORT
// =============================================================================

export default EventTimeText
export { EventTimeInput }
