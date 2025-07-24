// =============================================================================
// EVENT VISIBILITY COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { HStack, Text } from '@chakra-ui/react'
import { PiLock } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventVisibility = ({ visibility }) => {
   const { t } = useReactiveTranslation()

   if (!visibility) return null

   let visibilityText = t('visibility-default')

   switch (visibility.visibility) {
      case 'private':
         visibilityText = t('visibility-private')
         break
      case 'public':
         visibilityText = t('visibility-public')
         break
      case 'confidential':
         visibilityText = t('visibility-confidential')
         break
      case 'default':
         break
      default:
         // Keep default values for 'default' or unknown visibility
         break
   }

   if (visibility.visibility === 'default') return null

   return (
      <HStack spacing={3}>
         <PiLock size={16} />
         <Text fontSize='sm' color='text.primary'>
            {visibilityText}
         </Text>
      </HStack>
   )
}

EventVisibility.propTypes = {
   visibility: PropTypes.shape({
      visibility: PropTypes.oneOf([
         'default',
         'public',
         'private',
         'confidential'
      ]),
      transparency: PropTypes.string,
      status: PropTypes.string
   })
}

export default EventVisibility
