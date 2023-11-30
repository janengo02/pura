import React from 'react'

import { Flex } from '@chakra-ui/react'

// import t from '../../lang/i18n'

import dummyData from './dummydata'

import Toolbar from './toolbar/Toolbar'
import Column from './kanban/Column'

const Kanban = () => {
   const state = dummyData
   return (
      <Flex
         flexDirection='column'
         w='fit-content'
         h='fit-content'
         minH='full'
         minW='full'
         alignItems='center'
      >
         <Toolbar />
         {state.columnOrder.map((columnId) => {
            const column = state.columns[columnId]
            const tasks = column.taskIds.map((taskId) => state.tasks[taskId])
            return (
               <Column
                  key={column.id}
                  column={column}
                  tasks={tasks}
                  color='red.100'
               />
            )
         })}
      </Flex>
   )
}

export default Kanban
