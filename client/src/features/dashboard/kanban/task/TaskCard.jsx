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
import { updateTask } from '../../../../actions/task'

const TaskCard = ({ updateTask, page_id, task, draggableId, index }) => {
   const [hovered, setHovered] = useState(false)
   const [editing, setEditing] = useState(false)
   const dropdownMenu = useDisclosure()

   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onBlur = methods.handleSubmit(async (data) => {
      const formData = {
         page_id: page_id,
         task_id: task._id,
         title: data.title
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      await updateTask(formData)
      setEditing(false)
   })
   return (
      <Draggable draggableId={draggableId} index={index}>
         {(provided, snapshot) => (
            <Card
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               ref={provided.innerRef}
               variant='outline'
               boxShadow={snapshot.isDragging ? 'md' : undefined}
               p={2}
               w='full'
               paddingBottom={editing ? 0 : undefined}
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
               <Flex>
                  {task.schedule.length > 0 ? (
                     <Text fontSize='xs' color='gray.500'>
                        {t('schedule_status-true')}
                     </Text>
                  ) : (
                     <Text fontSize='xs' color='red.500'>
                        {t('schedule_status-false')}
                     </Text>
                  )}
                  <Spacer />
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
                           }}
                        >
                           {t('btn-delete-task')}
                        </MenuItem>
                     </MenuList>
                  </Menu>
               </Flex>
               {editing ? (
                  <FormProvider {...methods} h='fit-content'>
                     <form noValidate autoComplete='on'>
                        <MultiInput
                           name='title'
                           type='text'
                           variant='unstyled'
                           placeholder={t('placeholder-untitled')}
                           validation={s.name}
                           defaultValue={task.title}
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
                  <Text color='gray.600' fontWeight={600}>
                     {task.title}
                  </Text>
               )}
            </Card>
         )}
      </Draggable>
   )
}

TaskCard.propTypes = {
   updateTask: PropTypes.func.isRequired
}

export default connect(null, { updateTask })(TaskCard)
