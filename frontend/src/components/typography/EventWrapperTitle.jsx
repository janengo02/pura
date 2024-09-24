import React from 'react'
import { Text } from '@chakra-ui/react'

const EventWrapperTitle = ({ text, ...props }) => {
   return (
      <Text fontSize='xl' fontWeight={600} {...props}>
         {text}
      </Text>
   )
}

export default EventWrapperTitle
