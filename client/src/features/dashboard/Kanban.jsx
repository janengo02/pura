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
      const startSpace = +source.droppableId
      const endSpace = +destination.droppableId

      const oldTaskId = +draggableId
      const targetTask = state.tasks[oldTaskId]
      var newTaskId = destination.index
      if (endSpace !== 0) {
         newTaskId += state.task_map[endSpace - 1]
      }
      if (endSpace > startSpace) {
         newTaskId--
      }

      const newTaskArray = Array.from(state.tasks)
      const newTaskMap = Array.from(state.task_map)

      newTaskArray.splice(oldTaskId, 1)
      newTaskArray.splice(newTaskId, 0, targetTask)
      // Moving within the same column
      if (startSpace === endSpace) {
         const newState = {
            ...state,
            tasks: newTaskArray
         }
         setState(newState)
         return
      }
      // Moving between different columns
      if (endSpace < startSpace) {
         for (let i = endSpace; i < startSpace; i++) {
            newTaskMap[i]++
         }
      } else {
         for (let i = startSpace; i < endSpace; i++) {
            newTaskMap[i]--
         }
      }
      const newState = {
         ...state,
         task_map: newTaskMap,
         tasks: newTaskArray
      }
      setState(newState)
   }
   console.log(state)

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
                        <ProgressHeader
                           key={progress._id}
                           progress={progress}
                        />
                     )
                  })}
               </Flex>
               {state.group_order.map((group, i_group) => {
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
                           {state.progress_order?.map(
                              (progress, i_progress) => {
                                 const i_task_map =
                                    i_group * state.progress_order.length +
                                    i_progress
                                 var taskArray = []
                                 if (i_task_map === 0) {
                                    taskArray = state.tasks.slice(
                                       0,
                                       state.task_map[0]
                                    )
                                 } else {
                                    taskArray = state.tasks.slice(
                                       state.task_map[i_task_map - 1],
                                       state.task_map[i_task_map]
                                    )
                                 }
                                 return (
                                    <Column
                                       key={i_task_map} //has to match droppableId
                                       droppableId={i_task_map.toString()}
                                       taskPointer={
                                          state.task_map[i_task_map] -
                                          taskArray.length
                                       }
                                       progress={progress}
                                       tasks={taskArray}
                                    />
                                 )
                              }
                           )}
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
