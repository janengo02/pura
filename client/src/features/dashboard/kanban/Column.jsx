import React from 'react'
import { Button, Card, Flex } from '@chakra-ui/react'
import TaskCard from './TaskCard'
import { Droppable } from 'react-beautiful-dnd'
import { PiPlus } from 'react-icons/pi'
import t from '../../../lang/i18n'

const Column = ({ droppableId, taskPointer, progress, tasks }) => {
   return (
      <Droppable droppableId={droppableId}>
         {(provided, snapshot) => (
            <Card
               variant='filled'
               bg={progress.color}
               p={2}
               w={250}
               gap={2}
               boxShadow={snapshot.isDraggingOver ? 'outline' : undefined}
            >
               <Flex
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  flexDirection='column'
                  flexGrow={1}
               >
                  {tasks?.map((task, i_task) => (
                     <TaskCard
                        key={taskPointer + i_task} //has to match draggableId
                        task={task}
                        draggableId={(taskPointer + i_task).toString()}
                        index={i_task}
                     />
                  ))}
                  {provided.placeholder}
                  <Button
                     size='sm'
                     opacity={0.3}
                     variant='ghost'
                     justifyContent='flex-start'
                     leftIcon={<PiPlus />}
                  >
                     {t('btn-new')}
                  </Button>
               </Flex>
            </Card>
         )}
      </Droppable>
   )
}

export default Column
