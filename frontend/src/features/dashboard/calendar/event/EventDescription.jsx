// =============================================================================
// EVENT DESCRIPTION COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { HStack, Text } from '@chakra-ui/react'
import { PiTextAlignLeft } from 'react-icons/pi'

const EventDescription = ({ description }) => {
   if (!description) return null

   return (
      <HStack align='start' spacing={3} w='full'>
         <PiTextAlignLeft size={16} />
         <Text
            fontSize='sm'
            color='text.primary'
            whiteSpace='pre-wrap'
            wordBreak='break-word'
            flex={1}
         >
            {description}
         </Text>
      </HStack>
   )
}

EventDescription.propTypes = {
   description: PropTypes.string
}

export default EventDescription
