import { Card, Text } from '@chakra-ui/react'
import React from 'react'

const TaskCard = ({ scheduled, task }) => {
   return (
      <Card variant='outline' p={2} w='full'>
         {scheduled && (
            <Text fontSize='xs' color='gray.500'>
               Scheduled
            </Text>
         )}
         <Text color='gray.600' fontWeight={600}>
            {task.content}
         </Text>
      </Card>
   )
}

export default TaskCard
