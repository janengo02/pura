// =============================================================================
// EVENT METADATA COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { VStack, HStack, Text } from '@chakra-ui/react'
import { PiClock } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventMetadata = ({ createdDate, updatedDate }) => {
   const { t } = useReactiveTranslation()

   if (!createdDate && !updatedDate) return null

   return (
      <VStack
         align='start'
         spacing={1}
         mt={3}
         pt={3}
         borderTop='1px'
         borderColor='gray.200'
      >
         {createdDate && (
            <HStack spacing={2}>
               <PiClock size={14} color='gray.400' />
               <Text fontSize='xs' color='text.secondary'>
                  {t('event-created')}: {createdDate.toLocaleDateString()}
               </Text>
            </HStack>
         )}
         {updatedDate && (
            <HStack spacing={2}>
               <PiClock size={14} color='gray.400' />
               <Text fontSize='xs' color='text.secondary'>
                  {t('event-updated')}: {updatedDate.toLocaleDateString()}
               </Text>
            </HStack>
         )}
      </VStack>
   )
}

EventMetadata.propTypes = {
   createdDate: PropTypes.instanceOf(Date),
   updatedDate: PropTypes.instanceOf(Date)
}

export default EventMetadata
