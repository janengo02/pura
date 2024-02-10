import React, { useEffect } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import {
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
   VStack,
   useDisclosure
} from '@chakra-ui/react'
import {
   PiCalendar,
   PiCirclesFour,
   PiDotsThreeBold,
   PiNote,
   PiTrash
} from 'react-icons/pi'
import { deleteTask, updateTask } from '../../../../actions/task'
import t from '../../../../lang/i18n'
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { dashboardSchema as s } from '../../DashboardSchema'
import { MultiInput } from '../../../../components/MultiInput'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import ProgressSelect from './ProgressSelect'

const TaskModal = ({
   task: { task },
   page: { page },
   deleteTask,
   updateTask
}) => {
   const modalCard = useDisclosure()
   useEffect(() => {
      modalCard.onOpen()
   }, [task])
   const modalMenu = useDisclosure()
   const methods = useForm({
      resolver: yupResolver(s)
   })
   const delTask = () => {
      const formData = {
         page_id: page._id,
         task_id: task._id
      }
      deleteTask(formData)
   }
   const onBlur = methods.handleSubmit(async (data) => {
      const formData = {
         page_id: page._id,
         task_id: task._id,
         title: data.title
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      await updateTask(formData)
   })

   return (
      <>
         {task && (
            <Modal
               isOpen={modalCard.isOpen}
               onClose={modalCard.onClose}
               size='2xl'
               scrollBehavior='inside'
               blockScrollOnMount={false}
            >
               <ModalOverlay />

               <ModalContent h='full'>
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
                                 validation={s.title}
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
                        <ProgressSelect state={page} />
                        <TaskCardLabel
                           icon={<PiCirclesFour />}
                           text={t('label-group')}
                        />
                        <TaskCardLabel
                           icon={<PiCalendar />}
                           text={t('label-schedule')}
                        />
                        <TaskCardLabel
                           icon={<PiNote />}
                           text={t('label-note')}
                        />
                     </VStack>
                  </ModalBody>
                  <ModalFooter></ModalFooter>
               </ModalContent>
            </Modal>
         )}
      </>
   )
}

TaskModal.propTypes = {
   task: PropTypes.object.isRequired,
   page: PropTypes.object.isRequired,
   updateTask: PropTypes.func.isRequired,
   deleteTask: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   page: state.page
})
export default connect(mapStateToProps, { updateTask, deleteTask })(TaskModal)
