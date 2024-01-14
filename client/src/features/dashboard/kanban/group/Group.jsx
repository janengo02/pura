import React, { useState } from 'react'

import { Flex, IconButton, Spacer, VStack } from '@chakra-ui/react'
import GroupTitle from '../../../../components/typography/GroupTitle'
import Column from '../progress/Column'
import { PiDotsThreeBold, PiPlusBold } from 'react-icons/pi'

const Group = ({ group, i_group, state }) => {
   const [hovered, setHovered] = useState(false)

   return (
      <VStack
         p={3}
         paddingTop={2}
         borderWidth={2}
         borderColor={group.color}
         borderRadius={8}
         alignItems='flex-start'
         onMouseEnter={(e) => {
            e.preventDefault()
            setHovered(true)
         }}
         onMouseLeave={(e) => {
            e.preventDefault()
            setHovered(false)
         }}
      >
         <Flex w='full' alignItems='center'>
            <GroupTitle color={group.color}>{group.title}</GroupTitle>
            <Spacer />
            <Flex alignItems='center'>
               <IconButton
                  aria-label='Options'
                  icon={<PiDotsThreeBold />}
                  variant='ghost'
                  colorScheme='gray'
                  color='gray.600'
                  size='xs'
                  opacity={hovered ? 1 : 0}
               />
               <IconButton
                  aria-label='Options'
                  icon={<PiPlusBold />}
                  variant='ghost'
                  colorScheme='gray'
                  color='gray.600'
                  size='xs'
                  opacity={hovered ? 1 : 0}
               />
            </Flex>
         </Flex>
         <Flex gap={3}>
            {state?.progress_order?.map((progress, i_progress) => {
               const i_task_map =
                  i_group * state.progress_order.length + i_progress
               var taskArray = []
               if (i_task_map === 0) {
                  taskArray = state.tasks.slice(0, state.task_map[0])
               } else {
                  taskArray = state.tasks.slice(
                     state.task_map[i_task_map - 1],
                     state.task_map[i_task_map]
                  )
               }
               const newTaskInfo = {
                  page_id: state._id,
                  group_id: group._id,
                  progress_id: progress._id
               }
               return (
                  <Column
                     key={i_task_map} //has to match droppableId
                     droppableId={i_task_map.toString()}
                     taskPointer={state.task_map[i_task_map] - taskArray.length}
                     progress={progress}
                     tasks={taskArray}
                     newTaskInfo={newTaskInfo}
                  />
               )
            })}
         </Flex>
      </VStack>
   )
}

export default Group
