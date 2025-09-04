// =============================================================================
// EVENT LOCATION COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { HStack, Text, VStack } from '@chakra-ui/react'
import { PiMapPin } from 'react-icons/pi'

const EventLocation = ({ location }) => {
   if (!location) return null

   return (
      <HStack spacing={3}>
         <PiMapPin size={18} />
         <VStack align='start' spacing={0} maxW='full'>
            <Text fontSize='md' color='text.primary' isTruncated maxW='340px'>
               {location.displayName}
            </Text>
            {location.address && (
               <Text
                  fontSize='xs'
                  color='text.secondary'
                  isTruncated
                  maxW='340px'
               >
                  {location.address}
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
      address: PropTypes.string
   })
}

export default EventLocation
