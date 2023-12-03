import React from 'react'
import { Card, Flex } from '@chakra-ui/react'
import TaskCard from './TaskCard'
import { Droppable } from 'react-beautiful-dnd'

const Column = ({ color, column, tasks }) => {
   return (
      <Droppable droppableId={column.id}>
         {(provided, snapshot) => (
            <Card
               variant='filled'
               bg={color}
               p={3}
               paddingBottom={1}
               minW={250}
               minH={50}
               gap={2}
               boxShadow={snapshot.isDraggingOver ? 'outline' : undefined}
            >
               {column.title}

               <Flex
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  flexDirection='column'
                  flexGrow={1}
               >
                  {tasks.map((task, index) => (
                     <TaskCard
                        key={task.id}
                        scheduled={true}
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
