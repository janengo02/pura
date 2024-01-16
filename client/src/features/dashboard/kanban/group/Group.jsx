import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { deleteGroup } from '../../../../actions/group'

import {
   Flex,
   IconButton,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Spacer,
   VStack,
   useDisclosure
} from '@chakra-ui/react'
import GroupTitle from '../../../../components/typography/GroupTitle'
import Column from '../progress/Column'
import { PiDotsThreeBold, PiPlusBold, PiTrash } from 'react-icons/pi'
import t from '../../../../lang/i18n'

const Group = ({ deleteGroup, group, i_group, state }) => {
   const [hovered, setHovered] = useState(false)
   const dropdownMenu = useDisclosure()
   const delGroup = () => {
      const formData = {
         page_id: state._id,
         group_id: group._id
      }
      deleteGroup(formData)
   }
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
               <Menu
                  isOpen={dropdownMenu.isOpen}
                  onClose={dropdownMenu.onClose}
                  isLazy
               >
                  <MenuButton
                     as={IconButton}
                     icon={<PiDotsThreeBold />}
                     variant='ghost'
                     size='xs'
                     colorScheme='gray'
                     color='gray.600'
                     opacity={hovered || dropdownMenu.isOpen ? 1 : 0}
                     onClick={dropdownMenu.onOpen}
                  ></MenuButton>
                  <MenuList>
                     {state.group_order.length > 1 && (
                        <MenuItem
                           icon={<PiTrash size={20} />}
                           onClick={async (e) => {
                              e.preventDefault()
                              delGroup()
                           }}
                        >
                           {t('btn-delete')}
                        </MenuItem>
                     )}
                  </MenuList>
               </Menu>
               <IconButton
                  aria-label='Options'
                  icon={<PiPlusBold />}
                  variant='ghost'
                  colorScheme='gray'
                  color='gray.600'
                  size='xs'
                  opacity={hovered || dropdownMenu.isOpen ? 1 : 0}
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

Group.propTypes = {
   deleteGroup: PropTypes.func.isRequired
}

export default connect(null, { deleteGroup })(Group)
