import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTaskProgress } from '../../../../actions/task'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import { PiFlagBanner, PiPlus } from 'react-icons/pi'
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

const ProgressSelect = ({
   // Redux props
   updateTaskProgress,
   task: { task },
   page: { page }
}) => {
   const [hovered, setHovered] = useState(false)
   const tagSelect = useDisclosure()
   return (
      <Flex w='full' gap={3}>
         <TaskCardLabel icon={<PiFlagBanner />} text={t('label-progress')} />
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
                     bg={task.progress.color}
                     color={task.progress.title_color}
                  >
                     {task.progress.title}
                  </Tag>
               </Flex>
            </MenuButton>
            <MenuList w='512px'>
               {page?.progress_order?.map((progress_item) => (
                  <MenuItem
                     key={progress_item._id}
                     onClick={async (e) => {
                        e.preventDefault()
                        if (progress_item._id !== task.progress._id) {
                           updateTaskProgress(
                              page._id,
                              task._id,
                              progress_item._id
                           )
                        }
                     }}
                  >
                     <Tag
                        bg={progress_item.color}
                        color={progress_item.title_color}
                     >
                        {progress_item.title}
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
                  {t('btn-add-progress')}
               </MenuItem>
            </MenuList>
         </Menu>
      </Flex>
   )
}

ProgressSelect.propTypes = {
   task: PropTypes.object.isRequired,
   page: PropTypes.object.isRequired,
   updateTaskProgress: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   page: state.page
})
export default connect(mapStateToProps, { updateTaskProgress })(ProgressSelect)
