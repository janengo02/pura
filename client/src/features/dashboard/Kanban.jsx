import React, { useState } from 'react'

import { DragDropContext } from 'react-beautiful-dnd'
import { Flex, VStack } from '@chakra-ui/react'

// import t from '../../lang/i18n'

import { page } from './kanban/data'

import Toolbar from './toolbar/Toolbar'
import Column from './kanban/Column'
import ProgressHeader from './kanban/ProgressHeader'
import GroupTitle from '../../components/typography/GroupTitle'

const Kanban = () => {
   const [state, setState] = useState(page)
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
      const [destinationGroup, destinationProgress] =
         destination.droppableId.split('/')
      const [sourceGroup, sourceProgress] = source.droppableId.split('/')
      const startColumnIndex = state.task_map.findIndex(column=>column.group._id===sourceGroup && column.progress._id===sourceProgress)
      const finishColumnIndex = state.task_map.findIndex(column=>column.group._id===destinationGroup && column.progress._id===destinationProgress)
      const startColumn=state.task_map[startColumnIndex].tasks
      const finishColumn=state.task_map[finishColumnIndex].tasks
      const draggedTask = startColumn.find(task=>task._id===draggableId)

      if (destination.droppableId === source.droppableId) {
         // Moving within the same column
         const newTaskArray = Array.from(startColumn)
         newTaskArray.splice(source.index, 1)
         newTaskArray.splice(destination.index, 0, draggedTask)

         const newState = {
            ...state,
         }
         newState.task_map[finishColumnIndex].tasks=newTaskArray
         setState(newState)
         return
      }
      // Moving between different columns
      const startTaskArray = Array.from(startColumn)
      startTaskArray.splice(source.index, 1)
      const finishTaskArray = Array.from(finishColumn)
      finishTaskArray.splice(destination.index, 0, draggedTask)

      const newState = {
         ...state,
      }
      newState.task_map[startColumnIndex].tasks=startTaskArray
      newState.task_map[finishColumnIndex].tasks=finishTaskArray
      setState(newState)
   }

   return (
      <VStack
         w='fit-content'
         h='fit-content'
         minH='full'
         minW='full'
         alignItems='center'
         gap={0}
      >
         <Toolbar />
         <DragDropContext
            // onDragStart={}
            // onDragUpdate={}
            onDragEnd={onDragEnd}
         >
            <VStack
               flexDirection='column'
               w='fit-content'
               h='fit-content'
               minH='full'
               minW='full'
               alignItems='center'
               gap={3}
            >
               <Flex gap={3} paddingX={3}>
                  {state.progress_order.map((progress) => {
                     return (
                        <ProgressHeader key={progress._id} progress={progress} />
                     )
                  })}
               </Flex>
               {state.group_order.map((group) => {
                  return (
                     <VStack
                        key={group._id}
                        p={3}
                        borderWidth={2}
                        borderColor={group.color}
                        borderRadius={8}
                        alignItems='flex-start'
                     >
                        <GroupTitle color={group.color}>
                           {group.title}
                        </GroupTitle>
                        <Flex gap={3}>
                           {state.progress_order?.map((progress) => {
                              const targetColumn= state.task_map.filter(column =>column.group._id===group._id && column.progress._id===progress._id)
                              const taskArray = targetColumn[0].tasks
                              return (
                                 <Column
                                    key={progress._id}
                                    group={group}
                                    progress={progress}
                                    tasks={taskArray}
                                 />
                              )
                           })}
                        </Flex>
                     </VStack>
                  )
               })}
            </VStack>
         </DragDropContext>
      </VStack>
   )
}

export default Kanban
