// =============================================================================
// IMPORTS
// =============================================================================

// React
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

// UI Components
import { Text } from '@chakra-ui/react'

// Utils
import {
   stringToDateTime,
   stringToWeekDateTime,
   stringToTime
} from '../../../../utils/dates'

// =============================================================================
// CONSTANTS
// =============================================================================

const TEXT_STYLES = {
   fontSize: 'sm'
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Formats event time display based on start and end dates
 * @param {string|Date} start - Event start time
 * @param {string|Date} end - Event end time
 * @returns {string} Formatted time string
 */
const formatEventTime = (start, end) => {
   const startDate = stringToDateTime(start)
   const endDate = stringToDateTime(end)

   if (startDate === endDate) {
      // Same day event
      return `${stringToWeekDateTime(start)} ${stringToTime(
         start
      )} - ${stringToTime(end)}`
   }

   // Multi-day event
   return `${startDate} ${stringToTime(start)} - ${endDate} ${stringToTime(
      end
   )}`
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EventTimeText = React.memo(({ start, end }) => {
   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------

   const eventTimeString = useMemo(
      () => formatEventTime(start, end),
      [start, end]
   )

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return <Text {...TEXT_STYLES}>{eventTimeString}</Text>
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
EventTimeText.displayName = 'EventTimeText'

// PropTypes validation
EventTimeText.propTypes = {
   start: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
      .isRequired,
   end: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
      .isRequired
}

// =============================================================================
// EXPORT
// =============================================================================

export default EventTimeText
