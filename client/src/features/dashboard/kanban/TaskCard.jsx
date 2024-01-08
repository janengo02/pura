import React from 'react'
import { Card, Text } from '@chakra-ui/react'
import { Draggable } from 'react-beautiful-dnd'
import t from '../../../lang/i18n'

const TaskCard = ({ task, draggableId, index }) => {
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
               marginBottom={1}
            >
               {task.schedule.length > 0 ? (
                  <Text fontSize='xs' color='gray.500'>
                     {t('schedule_status-true')}
                  </Text>
               ) : (
                  <Text fontSize='xs' color='red.500'>
                     {t('schedule_status-false')}
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
