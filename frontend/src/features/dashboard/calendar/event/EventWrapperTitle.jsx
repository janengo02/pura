import React from 'react'
import { HStack, Square, Text } from '@chakra-ui/react'

const EventWrapperTitle = ({ text, color, ...props }) => {
   return (
      <HStack spacing={3} align='top'>
         <Square bg={color} size='16px' borderRadius={4} mt={2} />
         <Text fontSize='xl' fontWeight={600} {...props}>
            {text}
         </Text>
      </HStack>
   )
}

export default EventWrapperTitle
