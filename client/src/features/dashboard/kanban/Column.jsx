import React from 'react'
import { Card, Flex } from '@chakra-ui/react'
import TaskCard from './TaskCard'
import { Droppable } from 'react-beautiful-dnd'

const Column = ({ droppableId, taskPointer, progress, tasks }) => {
   return (
      <Droppable droppableId={droppableId}>
         {(provided, snapshot) => (
            <Card
               variant='filled'
               bg={progress.color}
               p={3}
               paddingBottom={1}
               w={250}
               minH={50}
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
               </Flex>
            </Card>
         )}
      </Droppable>
   )
}

export default Column
