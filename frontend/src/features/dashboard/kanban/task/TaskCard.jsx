import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import {
   Card,
   Flex,
   IconButton,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Spacer,
   Text,
   useDisclosure
} from '@chakra-ui/react'
import { Draggable } from 'react-beautiful-dnd'
import t from '../../../../lang/i18n'
import { PiDotsThreeBold, PiPencilLine, PiTrash } from 'react-icons/pi'
import { FormProvider, useForm } from 'react-hook-form'
import { MultiInput } from '../../../../components/MultiInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { dashboardSchema as s } from '../../DashboardSchema'
import { deleteTask, updateTask, showTaskModal } from '../../../../actions/task'

const TaskCard = ({
   task,
   isNew,
   draggableId,
   taskIndex,
   // Redux props
   _id,
   deleteTask,
   updateTask,
   showTaskModal
}) => {
   const [hovered, setHovered] = useState(false)
   const [editing, setEditing] = useState(false)
   const dropdownMenu = useDisclosure()
   const delTask = () => {
      const formData = {
         page_id: _id,
         task_id: task._id
      }
      deleteTask(formData)
   }
   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onBlur = methods.handleSubmit(async (data) => {
      const formData = {
         page_id: _id,
         task_id: task._id,
         title: data.title
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      await updateTask(formData)
      setEditing(false)
   })
   const showTask = async () => {
      const formData = {
         page_id: _id,
         task_id: task._id
      }
      await showTaskModal(formData)
   }

   return (
      <>
         <Draggable draggableId={draggableId} index={taskIndex}>
            {(provided, snapshot) => (
               <Card
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  variant='outline'
                  boxShadow={snapshot.isDragging ? 'md' : undefined}
                  bg={hovered ? 'gray.50' : undefined}
                  p={2}
                  paddingBottom={editing || isNew ? 0 : undefined}
                  w='full'
                  marginBottom={1}
                  onMouseEnter={(e) => {
                     e.preventDefault()
                     setHovered(true)
                  }}
                  onMouseLeave={(e) => {
                     e.preventDefault()
                     setHovered(false)
                  }}
               >
                  <Flex cursor='pointer'>
                     {task.schedule.length > 0 ? (
                        <Text
                           fontSize='xs'
                           color='gray.500'
                           onClick={(e) => {
                              e.preventDefault()
                              showTask()
                           }}
                        >
                           {t('schedule_status-true')}
                        </Text>
                     ) : (
                        <Text
                           fontSize='xs'
                           color='red.500'
                           onClick={(e) => {
                              e.preventDefault()
                              showTask()
                           }}
                        >
                           {t('schedule_status-false')}
                        </Text>
                     )}

                     <Spacer
                        onClick={(e) => {
                           e.preventDefault()
                           showTask()
                        }}
                     />
                     <Menu
                        isLazy
                        isOpen={dropdownMenu.isOpen}
                        onClose={dropdownMenu.onClose}
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
                           <MenuItem
                              icon={<PiPencilLine size={18} />}
                              fontSize='sm'
                              onClick={async (e) => {
                                 e.preventDefault()
                                 setEditing(true)
                              }}
                           >
                              {t('btn-edit-name')}
                           </MenuItem>
                           <MenuItem
                              icon={<PiTrash size={18} />}
                              fontSize='sm'
                              onClick={async (e) => {
                                 e.preventDefault()
                                 delTask()
                              }}
                           >
                              {t('btn-delete-task')}
                           </MenuItem>
                        </MenuList>
                     </Menu>
                  </Flex>
                  <Flex alignItems='center' overflow='hidden' cursor='pointer'>
                     {editing || isNew ? (
                        <FormProvider {...methods} h='fit-content'>
                           <form
                              noValidate
                              autoComplete='on'
                              style={{ width: '100%' }}
                           >
                              <MultiInput
                                 name='title'
                                 type='textarea'
                                 variant='unstyled'
                                 placeholder={t('placeholder-untitled')}
                                 validation={s.title}
                                 defaultValue={isNew ? undefined : task.title}
                                 fontWeight={600}
                                 borderRadius={0}
                                 autoFocus
                                 onFocus={async (e) => {
                                    e.preventDefault()
                                    e.currentTarget.select()
                                 }}
                                 onBlur={async (e) => {
                                    e.preventDefault()
                                    onBlur()
                                 }}
                              />
                           </form>
                        </FormProvider>
                     ) : (
                        <Text
                           w='full'
                           color='gray.600'
                           fontWeight={600}
                           onClick={(e) => {
                              e.preventDefault()
                              showTask()
                           }}
                        >
                           {task.title}
                        </Text>
                     )}
                  </Flex>
               </Card>
            )}
         </Draggable>
      </>
   )
}

TaskCard.propTypes = {
   _id: PropTypes.string.isRequired,
   updateTask: PropTypes.func.isRequired,
   deleteTask: PropTypes.func.isRequired,
   showTaskModal: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   _id: state.page._id
})

export default connect(mapStateToProps, {
   updateTask,
   deleteTask,
   showTaskModal
})(TaskCard)
