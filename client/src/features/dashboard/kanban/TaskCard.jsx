import { Card, Text } from '@chakra-ui/react'
import React from 'react'
import { Draggable } from 'react-beautiful-dnd'

const TaskCard = ({ task, draggableId, index }) => {
   console.log(draggableId)
   return (
      <Draggable draggableId={draggableId} index={index}>
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
               {task.schedule.length > 0 ? (
                  <Text fontSize='xs' color='gray.500'>
                     Scheduled
                  </Text>
               ) : (
                  <Text fontSize='xs' color='red.500'>
                     Not scheduled
                  </Text>
               )}
               <Text color='gray.600' fontWeight={600}>
                  {task.title}
               </Text>
            </Card>
         )}
      </Draggable>
   )
}

export default TaskCard
