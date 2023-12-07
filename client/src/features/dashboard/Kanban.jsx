import React, { useState } from 'react'

import { DragDropContext } from 'react-beautiful-dnd'
import { Flex, Text, VStack } from '@chakra-ui/react'

// import t from '../../lang/i18n'

import { pagesDummy, tasksDummy } from './kanban/dummydata'

import Toolbar from './toolbar/Toolbar'
import Column from './kanban/Column'
import ProgressHeader from './kanban/ProgressHeader'
import GroupTitle from '../../components/typography/GroupTitle'

const Kanban = () => {
   const [state, setState] = useState(pagesDummy)
   const [tasks, setTasks] = useState(tasksDummy)
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
      const startColumn = state.taskMap[sourceGroup][sourceProgress]
      // const finishColumn = state.taskMap[destinationGroup][destinationProgress]

      if (destination.droppableId === source.droppableId) {
         // Moving within the same column
         const newTaskIds = Array.from(startColumn)
         newTaskIds.splice(source.index, 1)
         newTaskIds.splice(destination.index, 0, draggableId)

         const newState = {
            ...state,
            taskMap: {
               ...state.taskMap,
               [destinationGroup]: {
                  ...state[destinationGroup],
                  [destinationProgress]: newTaskIds
               }
            }
         }
         setState(newState)
         console.log(state)
         return
      }
      // Moving between different columns
      // const startTaskIds = Array.from(startColumn.taskIds)
      // startTaskIds.splice(source.index, 1)
      // const newStartColumn = {
      //    ...startColumn,
      //    taskIds: startTaskIds
      // }
      // const finishTaskIds = Array.from(finishColumn.taskIds)

      // finishTaskIds.splice(destination.index, 0, draggableId)

      // const newFinishColumn = {
      //    ...finishColumn,
      //    taskIds: finishTaskIds
      // }

      // const newState = {
      //    ...state,
      //    columns: {
      //       ...state.columns,
      //       [source.droppableId]: newStartColumn,
      //       [destination.droppableId]: newFinishColumn
      //    }
      // }
      // setState(newState)
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
                  {state.progressOrder.map((progress) => {
                     return (
                        <ProgressHeader key={progress.id} progress={progress} />
                     )
                  })}
               </Flex>
               {state.groupOrder.map((group) => {
                  const groupId = group.id

                  return (
                     <VStack
                        key={group.id}
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
                           {state.progressOrder.map((progress) => {
                              const progressId = progress.id
                              const taskArray = state.taskMap[groupId][
                                 progressId
                              ].map((taskId) =>
                                 tasks.find((task) => task.id === taskId)
                              )
                              return (
                                 <Column
                                    key={progress.id}
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
