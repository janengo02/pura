import React from 'react'
import { Card, Flex } from '@chakra-ui/react'
import TaskCard from './TaskCard'
import { Droppable } from 'react-beautiful-dnd'

const Column = ({ group, progress, tasks }) => {
   return (
      <Droppable droppableId={group._id + '/' + progress._id}>
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
                  {tasks?.map((task, index) => (
                     <TaskCard
                        key={task._id}
                        task={task}
                        index={index}
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
