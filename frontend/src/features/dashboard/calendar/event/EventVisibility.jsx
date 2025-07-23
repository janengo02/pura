// =============================================================================
// EVENT VISIBILITY COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { HStack, Text } from '@chakra-ui/react'
import { PiEye, PiLock, PiGlobeHemisphereWest } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventVisibility = ({ visibility }) => {
   const { t } = useReactiveTranslation()

   if (!visibility) return null

   let visibilityIcon = PiEye
   let visibilityText = t('visibility-default')
   let visibilityColor = 'gray'

   switch (visibility.visibility) {
      case 'private':
         visibilityIcon = PiLock
         visibilityText = t('visibility-private')
         visibilityColor = 'red'
         break
      case 'public':
         visibilityIcon = PiGlobeHemisphereWest
         visibilityText = t('visibility-public')
         visibilityColor = 'green'
         break
      case 'confidential':
         visibilityIcon = PiLock
         visibilityText = t('visibility-confidential')
         visibilityColor = 'orange'
         break
      default:
         // Keep default values for 'default' or unknown visibility
         break
   }

   if (visibility.visibility === 'default') return null

   return (
      <HStack spacing={2} mb={2}>
         {React.createElement(visibilityIcon, {
            size: 16,
            color: `${visibilityColor}.500`
         })}
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
