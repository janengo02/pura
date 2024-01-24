import React from 'react'
import { Flex, Text } from '@chakra-ui/react'

const TaskCardLabel = ({ icon, text, ...props }) => {
   return (
      <Flex alignItems='center' gap={3} color='gray.400' {...props}>
         {icon}
         <Text>{text}</Text>
      </Flex>
   )
}

export default TaskCardLabel
