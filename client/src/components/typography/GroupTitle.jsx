import React from 'react'
import { Text } from '@chakra-ui/react'

const GroupTitle = ({ children, color }) => {
   return (
      <Text color={color} fontWeight={500}>
         {children}
      </Text>
   )
}

export default GroupTitle
