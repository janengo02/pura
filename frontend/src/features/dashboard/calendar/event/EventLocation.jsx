// =============================================================================
// EVENT LOCATION COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { HStack, VStack, Text } from '@chakra-ui/react'
import { PiMapPin } from 'react-icons/pi'

const EventLocation = ({ location }) => {
   if (!location) return null

   return (
      <HStack spacing={2} mb={2}>
         <PiMapPin size={16} color="gray.500" />
         <VStack align="start" spacing={0}>
            <Text
               fontSize="sm"
               color="text.primary"
               wordBreak="break-word"
            >
               {location.displayName || location.raw}
            </Text>
            {location.address && (
               <Text
                  fontSize="xs"
                  color="text.secondary"
                  wordBreak="break-word"
               >
                  {location.address.full}
               </Text>
            )}
         </VStack>
      </HStack>
   )
}

EventLocation.propTypes = {
   location: PropTypes.shape({
      raw: PropTypes.string,
      displayName: PropTypes.string,
      address: PropTypes.shape({
         full: PropTypes.string,
         parts: PropTypes.array
      })
   })
}

export default EventLocation