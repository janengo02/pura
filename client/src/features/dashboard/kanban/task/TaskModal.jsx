import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import {
   Box,
   Card,
   CardBody,
   CardHeader,
   IconButton,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   ScaleFade,
   VStack,
   useDisclosure
} from '@chakra-ui/react'
import { PiDotsThreeBold, PiNote, PiTrash } from 'react-icons/pi'
import { deleteTask, updateTask } from '../../../../actions/task'
import t from '../../../../lang/i18n'
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { dashboardSchema as s } from '../../DashboardSchema'
import { MultiInput } from '../../../../components/MultiInput'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import ProgressSelect from './ProgressSelect'
import GroupSelect from './GroupSelect'
import ScheduleSelect from './ScheduleSelect'

const TaskModal = ({
   leftWidth,
   // Redux props
   task: { task },
   page: { page },
   deleteTask,
   updateTask
}) => {
   const [taskTitle, setTaskTitle] = useState()
   const [taskContent, setTaskContent] = useState()
   const modalCard = useDisclosure()
   useEffect(() => {
      if (task) {
         setTaskTitle(task.title)
         setTaskContent(task.content)
         modalCard.onOpen()
      } else {
         modalCard.onClose()
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
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
   // eslint-disable-next-line react-hooks/exhaustive-deps
   const onUpdateTitle = async () => {
      const formData = {
         page_id: page._id,
         task_id: task._id,
         title: taskTitle
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      await updateTask(formData)
   }
   const onUpdateContent = async () => {
      const formData = {
         page_id: page._id,
         task_id: task._id,
         content: taskContent
      }
      await updateTask(formData)
   }

   useEffect(() => {
      if (taskTitle && taskTitle !== task.title) {
         const timeOutId = setTimeout(() => onUpdateTitle(), 500)
         return () => clearTimeout(timeOutId)
      }
   }, [taskTitle])
   useEffect(() => {
      if (taskContent && taskContent !== task.content) {
         const timeOutId = setTimeout(() => onUpdateContent(), 500)
         return () => clearTimeout(timeOutId)
      }
   }, [taskContent])
   return (
      <>
         {modalCard.isOpen ? (
            <Box
               position='fixed'
               w={leftWidth}
               h='95%'
               top={20}
               left={0}
               display='flex'
               justifyContent='center'
               alignItems='center'
               overflow='hidden'
            >
               <Box
                  position='fixed'
                  w={leftWidth}
                  h='95%'
                  top={20}
                  left={0}
                  bg='gray.500'
                  opacity={0.3}
                  onClick={modalCard.onClose}
               />
               <ScaleFade initialScale={0.9} in={modalCard.isOpen}>
                  <Card
                     size='2xl'
                     paddingX={6}
                     paddingY={4}
                     borderRadius={8}
                     boxShadow='xl'
                  >
                     <CardHeader display='flex' justifyContent='flex-end'>
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
                     </CardHeader>

                     <CardBody h='full'>
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
                                    value={taskTitle}
                                    fontWeight={600}
                                    borderRadius={0}
                                    fontSize='2xl'
                                    onChange={async (e) => {
                                       e.preventDefault()
                                       setTaskTitle(e.target.value)
                                    }}
                                    onBlur={async (e) => {
                                       e.preventDefault()
                                       setTaskTitle(e.target.value)
                                    }}
                                 />
                              </form>
                           </FormProvider>
                           <ProgressSelect />
                           <GroupSelect />
                           <ScheduleSelect />
                           <TaskCardLabel
                              icon={<PiNote />}
                              text={t('label-note')}
                           />
                           <FormProvider {...methods} h='fit-content' w='full'>
                              <form
                                 noValidate
                                 autoComplete='on'
                                 style={{ width: '100%' }}
                              >
                                 <MultiInput
                                    name='content'
                                    type='textarea'
                                    variant='unstyled'
                                    value={taskContent}
                                    borderRadius={0}
                                    onChange={async (e) => {
                                       e.preventDefault()
                                       setTaskContent(e.target.value)
                                    }}
                                    onBlur={async (e) => {
                                       e.preventDefault()
                                       setTaskContent(e.target.value)
                                    }}
                                 />
                              </form>
                           </FormProvider>
                        </VStack>
                     </CardBody>
                  </Card>
               </ScaleFade>
            </Box>
         ) : null}
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
