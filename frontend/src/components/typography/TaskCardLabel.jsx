import React from 'react'
import { Flex, Text } from '@chakra-ui/react'

const TaskCardLabel = ({ icon, text, ...props }) => {
   return (
      <Flex
         minW={125}
         alignItems='center'
         gap={3}
         color='text.secondary'
         {...props}
      >
         {icon}
         <Text fontSize='md'>{text}</Text>
      </Flex>
   )
}

export default TaskCardLabel
