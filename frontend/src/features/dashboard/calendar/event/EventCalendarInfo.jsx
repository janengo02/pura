// =============================================================================
// EVENT CALENDAR INFO COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { HStack, Text } from '@chakra-ui/react'
import { PiCalendar } from 'react-icons/pi'

const EventCalendarInfo = ({ calendar }) => {
   if (!calendar) return null

   return (
      <HStack spacing={2} mb={2}>
         <PiCalendar size={16} />
         <Text fontSize="sm" color="text.primary">
            {calendar}
         </Text>
      </HStack>
   )
}

EventCalendarInfo.propTypes = {
   calendar: PropTypes.string
}

export default EventCalendarInfo