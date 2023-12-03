import { Card, Text } from '@chakra-ui/react'
import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

const TaskCard = ({ scheduled, task, index }) => {
   return (
      <Draggable draggableId={task.id} index={index}>
         {(provided, snapshot) => (
            <Card
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               ref={provided.innerRef}
               variant='outline'
               boxShadow={snapshot.isDragging ? 'md' : undefined}
               p={2}
               w='full'
               marginBottom={2}
            >
               {scheduled && (
                  <Text fontSize='xs' color='gray.500'>
                     Scheduled
                  </Text>
               )}
               <Text color='gray.600' fontWeight={600}>
                  {task.content}
               </Text>
            </Card>
         )}
      </Draggable>
   )
}

export default TaskCard
