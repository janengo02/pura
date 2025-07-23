// =============================================================================
// EVENT DESCRIPTION COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { VStack, Text } from '@chakra-ui/react'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventDescription = ({ description }) => {
   const { t } = useReactiveTranslation()

   if (!description) return null

   return (
      <VStack align='start' spacing={1} mb={3}>
         <Text fontSize='sm' fontWeight='medium' color='text.secondary'>
            {t('event-description')}
         </Text>
         <Text
            fontSize='sm'
            color='text.primary'
            whiteSpace='pre-wrap'
            wordBreak='break-word'
         >
            {description}
         </Text>
      </VStack>
   )
}

EventDescription.propTypes = {
   description: PropTypes.string
}

export default EventDescription
