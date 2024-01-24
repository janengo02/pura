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
   Modal,
   ModalBody,
   ModalContent,
   ModalFooter,
   ModalHeader,
   ModalOverlay,
   Spacer,
   Text,
   VStack,
   useDisclosure
} from '@chakra-ui/react'
import { Draggable } from 'react-beautiful-dnd'
import t from '../../../../lang/i18n'
import {
   PiCalendar,
   PiCirclesFour,
   PiDotsThreeBold,
   PiFlagBanner,
   PiNote,
   PiPencilLine,
   PiTrash
} from 'react-icons/pi'
import { FormProvider, useForm } from 'react-hook-form'
import { MultiInput } from '../../../../components/MultiInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { dashboardSchema as s } from '../../DashboardSchema'
import { deleteTask, updateTask } from '../../../../actions/task'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'

const TaskCard = ({
   deleteTask,
   updateTask,
   page_id,
   task,
   draggableId,
   index
}) => {
   const [hovered, setHovered] = useState(false)
   const [editing, setEditing] = useState(false)
   const dropdownMenu = useDisclosure()
   const modalMenu = useDisclosure()
   const modalCard = useDisclosure()
   const delTask = () => {
      const formData = {
         page_id: page_id,
         task_id: task._id
      }
      deleteTask(formData)
   }
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
      <>
         <Draggable draggableId={draggableId} index={index}>
            {(provided, snapshot) => (
               <Card
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  variant='outline'
                  boxShadow={snapshot.isDragging ? 'md' : undefined}
                  bg={hovered ? 'gray.50' : undefined}
                  p={2}
                  paddingBottom={editing ? 0 : undefined}
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
                  <Flex
                     cursor='pointer'
                     marginBottom={editing ? -2 : undefined}
                  >
                     {task.schedule.length > 0 ? (
                        <Text
                           fontSize='xs'
                           color='gray.500'
                           onClick={modalCard.onOpen}
                        >
                           {t('schedule_status-true')}
                        </Text>
                     ) : (
                        <Text
                           fontSize='xs'
                           color='red.500'
                           onClick={modalCard.onOpen}
                        >
                           {t('schedule_status-false')}
                        </Text>
                     )}

                     <Spacer onClick={modalCard.onOpen} />
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
                     {editing ? (
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
                        <Text
                           w='full'
                           color='gray.600'
                           fontWeight={600}
                           onClick={modalCard.onOpen}
                        >
                           {task.title}
                        </Text>
                     )}
                  </Flex>
               </Card>
            )}
         </Draggable>
         <Modal
            isOpen={modalCard.isOpen}
            onClose={modalCard.onClose}
            size='2xl'
            scrollBehavior='inside'
            blockScrollOnMount={false}
         >
            <ModalOverlay />
            <ModalContent>
               <ModalHeader display='flex' justifyContent='flex-end'>
                  <Menu
                     isLazy
                     isOpen={modalMenu.isOpen}
                     onClose={modalMenu.onClose}
                  >
                     <MenuButton
                        as={IconButton}
                        icon={<PiDotsThreeBold size={20} />}
                        variant='ghost'
                        size='xs'
                        colorScheme='gray'
                        color='gray.600'
                        onClick={modalMenu.onOpen}
                     ></MenuButton>
                     <MenuList>
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
               </ModalHeader>
               <ModalBody>
                  <VStack w='full' alignItems='flex-start' gap={5}>
                     <FormProvider {...methods} h='fit-content' w='full'>
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
                              validation={s.name}
                              defaultValue={task.title}
                              fontWeight={600}
                              borderRadius={0}
                              fontSize='2xl'
                              onBlur={async (e) => {
                                 e.preventDefault()
                                 onBlur()
                              }}
                           />
                        </form>
                     </FormProvider>
                     <TaskCardLabel
                        icon={<PiFlagBanner />}
                        text={t('label-progress')}
                     />
                     <TaskCardLabel
                        icon={<PiCirclesFour />}
                        text={t('label-group')}
                     />
                     <TaskCardLabel
                        icon={<PiCalendar />}
                        text={t('label-schedule')}
                     />
                     <TaskCardLabel icon={<PiNote />} text={t('label-note')} />
                  </VStack>
               </ModalBody>
               <ModalFooter></ModalFooter>
            </ModalContent>
         </Modal>
      </>
   )
}

TaskCard.propTypes = {
   updateTask: PropTypes.func.isRequired,
   deleteTask: PropTypes.func.isRequired
}

export default connect(null, { updateTask, deleteTask })(TaskCard)
