import React from 'react'
import { Flex, Text } from '@chakra-ui/react'

const TaskCardLabel = ({ icon, text, ...props }) => {
   return (
      <Flex minW={115} alignItems='center' gap={3} color='gray.400' {...props}>
         {icon}
         <Text fontSize='sm'>{text}</Text>
      </Flex>
   )
}

export default TaskCardLabel
