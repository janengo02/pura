// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// UI Components
import { Flex, Input, Text } from '@chakra-ui/react'

// Utils & Hooks
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import {
   formatEventTime,
   toDateTimeLocalFormat
} from '../../../../utils/eventUtils'

// =============================================================================
// CONSTANTS
// =============================================================================

const TEXT_STYLES = {
   fontSize: 'md',
   mb: 2,
   ml: 7
}
// =============================================================================
// MAIN COMPONENT (TEXT)
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

// =============================================================================
// MAIN COMPONENT (INPUT)
// =============================================================================

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
            {startTimeInput} - {endTimeInput} {t('label-timezone-jst')}
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
