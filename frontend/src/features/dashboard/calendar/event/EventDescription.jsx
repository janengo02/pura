// =============================================================================
// EVENT DESCRIPTION COMPONENT
// =============================================================================

import React, { useCallback } from 'react'
import PropTypes from 'prop-types'
import { HStack, Text, Textarea } from '@chakra-ui/react'
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

const EventDescriptionInput = React.memo(({ description, setDescription }) => {
   const handleDescriptionChange = useCallback(
      (e) => {
         setDescription(e.target.value)
      },
      [setDescription]
   )

   return (
      <HStack align='start' spacing={3} w='full'>
         <PiTextAlignLeft size={16} />
         <Textarea
            value={description}
            onChange={handleDescriptionChange}
            placeholder='Event description'
            variant='filled'
            minH='100px'
            resize='none'
            bg='bg.canvas'
            rows={10}
            _hover={{ bg: 'bg.canvas' }}
            _active={{ bg: 'bg.canvas' }}
            _focusVisible={{ bg: 'bg.canvas', borderColor: 'transparent' }}
         />
      </HStack>
   )
})
EventDescriptionInput.propTypes = {
   description: PropTypes.string.isRequired,
   setDescription: PropTypes.func.isRequired
}

export default EventDescription
export { EventDescriptionInput }
