import React from 'react'
import { Heading } from '@chakra-ui/react'

const GroupTitle = ({ children, color }) => {
   return (
      <Heading as='h6' size='xs' color={color}>
         {children}
      </Heading>
   )
}

export default GroupTitle
