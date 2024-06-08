import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask } from '../../../../actions/task'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import { PiCirclesFour, PiPlus } from 'react-icons/pi'
import t from '../../../../lang/i18n'
import {
   Flex,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Tag,
   useDisclosure
} from '@chakra-ui/react'

const GroupSelect = ({
   // Redux props
   updateTask,
   task: { task },
   page: { page }
}) => {
   const [hovered, setHovered] = useState(false)
   const tagSelect = useDisclosure()
   return (
      <Flex w='full' gap={3}>
         <TaskCardLabel icon={<PiCirclesFour />} text={t('label-group')} />
         <Menu isLazy isOpen={tagSelect.isOpen} onClose={tagSelect.onClose}>
            <MenuButton
               w='full'
               onMouseEnter={(e) => {
                  e.preventDefault()
                  setHovered(true)
               }}
               onMouseLeave={(e) => {
                  e.preventDefault()
                  setHovered(false)
               }}
               onClick={tagSelect.onOpen}
            >
               <Flex
                  w='full'
                  p={1}
                  borderRadius='md'
                  bg={hovered || tagSelect.isOpen ? 'gray.50' : undefined}
               >
                  <Tag
                     borderColor='gray.100'
                     borderWidth={1}
                     bg='white'
                     color={task.group.color}
                  >
                     {task.group.title}
                  </Tag>
               </Flex>
            </MenuButton>
            <MenuList w='488px'>
               {page?.group_order?.map((group_item) => (
                  <MenuItem
                     key={group_item._id}
                     onClick={async (e) => {
                        e.preventDefault()
                        if (group_item._id !== task.group._id) {
                           updateTask({
                              page_id: page._id,
                              task_id: task._id,
                              group_id: group_item._id,
                              task_detail_flg: true
                           })
                        }
                     }}
                  >
                     <Tag
                        borderColor='gray.100'
                        borderWidth={1}
                        bg='white'
                        color={group_item.color}
                     >
                        {group_item.title}
                     </Tag>
                  </MenuItem>
               ))}
               <MenuItem
                  icon={<PiPlus size={14} />}
                  fontSize='sm'
                  color='gray.400'
                  onClick={async (e) => {
                     e.preventDefault()
                  }}
               >
                  {t('btn-add-group')}
               </MenuItem>
            </MenuList>
         </Menu>
      </Flex>
   )
}

GroupSelect.propTypes = {
   task: PropTypes.object.isRequired,
   page: PropTypes.object.isRequired,
   updateTask: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   page: state.page
})
export default connect(mapStateToProps, { updateTask })(GroupSelect)
