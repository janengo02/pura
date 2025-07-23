// =============================================================================
// EVENT ORGANIZER COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { HStack, VStack, Text, Badge } from '@chakra-ui/react'
import { PiUser } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventOrganizer = ({ organizer }) => {
   const { t } = useReactiveTranslation()

   if (!organizer || !organizer.email) return null

   return (
      <HStack spacing={2} mb={2}>
         <PiUser size={16} color='gray.500' />
         <VStack align='start' spacing={0}>
            <Text fontSize='sm' color='text.primary' wordBreak='break-word'>
               {organizer.displayName || organizer.email}
               {organizer.self && (
                  <Badge ml={1} size='sm' colorScheme='green'>
                     {t('organizer-you')}
                  </Badge>
               )}
            </Text>
            {organizer.displayName && (
               <Text fontSize='xs' color='text.secondary' wordBreak='break-all'>
                  {organizer.email}
               </Text>
            )}
         </VStack>
      </HStack>
   )
}

EventOrganizer.propTypes = {
   organizer: PropTypes.shape({
      email: PropTypes.string,
      displayName: PropTypes.string,
      self: PropTypes.bool
   })
}

export default EventOrganizer
