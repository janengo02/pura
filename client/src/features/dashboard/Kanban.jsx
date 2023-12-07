import React, { useState } from 'react'

import { DragDropContext } from 'react-beautiful-dnd'
import { Flex } from '@chakra-ui/react'

// import t from '../../lang/i18n'

import dummyData from './kanban/dummydata'
import { pagesDummy } from './kanban/dummydata'

import Toolbar from './toolbar/Toolbar'
import Column from './kanban/Column'
import ProgressHeader from './kanban/ProgressHeader'

const Kanban = () => {
   const [state, setState] = useState(pagesDummy)
   const onDragEnd = (result) => {
      const { destination, source, draggableId } = result
      if (!destination) {
         return
      }
      if (
         destination.droppableId === source.droppableId &&
         destination.index === source.index
      ) {
         return
      }
      const startColumn = state.columns[source.droppableId]
      const finishColumn = state.columns[destination.droppableId]

      if (startColumn === finishColumn) {
         // Moving within the same column
         const newTaskIds = Array.from(startColumn.taskIds)
         newTaskIds.splice(source.index, 1)
         newTaskIds.splice(destination.index, 0, draggableId)

         const newColumn = {
            ...startColumn,
            taskIds: newTaskIds
         }

         const newState = {
            ...state,
            columns: {
               ...state.columns,
               [destination.droppableId]: newColumn
            }
         }

         setState(newState)
         return
      }
      // Moving between different columns
      const startTaskIds = Array.from(startColumn.taskIds)
      startTaskIds.splice(source.index, 1)
      const newStartColumn = {
         ...startColumn,
         taskIds: startTaskIds
      }
      const finishTaskIds = Array.from(finishColumn.taskIds)

      finishTaskIds.splice(destination.index, 0, draggableId)

      const newFinishColumn = {
         ...finishColumn,
         taskIds: finishTaskIds
      }

      const newState = {
         ...state,
         columns: {
            ...state.columns,
            [source.droppableId]: newStartColumn,
            [destination.droppableId]: newFinishColumn
         }
      }
      setState(newState)
   }

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
         <DragDropContext
         // onDragStart={}
         // onDragUpdate={}
         // onDragEnd={onDragEnd}
         >
            <Flex gap={5}>
               {state.progressOrder.map((progress) => {
                  return (
                     <ProgressHeader key={progress.id} progress={progress} />
                  )
               })}
            </Flex>
         </DragDropContext>
      </Flex>
   )
}

export default Kanban
