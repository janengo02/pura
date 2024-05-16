import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateGroup } from '../../../../actions/task'
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
   state,
   // Redux props
   updateGroup,
   task: { task }
}) => {
   const [hovered, setHovered] = useState(false)
   const tagSelect = useDisclosure()
   const currentGroup = state.group_order[task.i_group]
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
                     color={currentGroup.color}
                  >
                     {currentGroup.title}
                  </Tag>
               </Flex>
            </MenuButton>
            <MenuList w='512px'>
               {state?.group_order?.map((group_item) => (
                  <MenuItem
                     key={group_item._id}
                     onClick={async (e) => {
                        e.preventDefault()
                        if (group_item._id !== currentGroup._id) {
                           updateGroup(state, task, group_item)
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
   updateGroup: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task
})
export default connect(mapStateToProps, { updateGroup })(GroupSelect)
