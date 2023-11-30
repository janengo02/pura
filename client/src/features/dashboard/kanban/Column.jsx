import React from 'react'
import { Card } from '@chakra-ui/react'
import TaskCard from './TaskCard'

const Column = ({ color, column, tasks }) => {
   return (
      <Card variant='filled' bg={color} p={3} minW={250} gap={2}>
         {column.title}
         {tasks.map((task) => (
            <TaskCard key={task.id} scheduled={true} task={task} />
         ))}
      </Card>
   )
}

export default Column
