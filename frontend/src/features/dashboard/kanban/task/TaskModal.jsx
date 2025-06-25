// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import {
   deleteTaskAction,
   updateTaskAction
} from '../../../../actions/taskActions'

// External Libraries
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// UI Components
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

// Internal Components
import { MultiInput } from '../../../../components/MultiInput'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import ProgressSelect from './ProgressSelect'
import GroupSelect from './GroupSelect'
import ScheduleSelect from './ScheduleSelect'

// Utils & Icons
import { PiDotsThreeBold, PiNote, PiTrash } from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { dashboardSchema as s } from '../../DashboardSchema'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const TaskModal = React.memo(
   ({
      leftWidth = '100%',

      // Redux props
      taskData: { task, _id },
      deleteTaskAction,
      updateTaskAction
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------

      const [taskTitle, setTaskTitle] = useState('')
      const [taskContent, setTaskContent] = useState('')

      const modalCard = useDisclosure()
      const modalMenu = useDisclosure()

      const methods = useForm({
         resolver: yupResolver(s)
      })

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const isTaskLoaded = useMemo(() => Boolean(task), [task])

      const hasTaskTitleChanged = useMemo(
         () => taskTitle && taskTitle !== task?.title,
         [taskTitle, task?.title]
      )

      const hasTaskContentChanged = useMemo(
         () => taskContent && taskContent !== task?.content,
         [taskContent, task?.content]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDeleteTask = useCallback(() => {
         const formData = {
            page_id: _id,
            task_id: task._id
         }
         deleteTaskAction(formData)
      }, [_id, task?._id, deleteTaskAction])

      const handleUpdateTitle = useCallback(async () => {
         const formData = {
            page_id: _id,
            task_id: task._id,
            title: taskTitle || 'Untitled'
         }
         await updateTaskAction(formData)
      }, [_id, task?._id, taskTitle, updateTaskAction])

      const handleUpdateContent = useCallback(async () => {
         const formData = {
            page_id: _id,
            task_id: task._id,
            content: taskContent
         }
         await updateTaskAction(formData)
      }, [_id, task?._id, taskContent, updateTaskAction])

      const handleTitleChange = useCallback((e) => {
         e.preventDefault()
         setTaskTitle(e.target.value)
      }, [])

      const handleTitleBlur = useCallback((e) => {
         e.preventDefault()
         setTaskTitle(e.target.value)
      }, [])

      const handleContentChange = useCallback((e) => {
         e.preventDefault()
         setTaskContent(e.target.value)
      }, [])

      const handleContentBlur = useCallback((e) => {
         e.preventDefault()
         setTaskContent(e.target.value)
      }, [])

      const handleMenuDelete = useCallback(
         async (e) => {
            e.preventDefault()
            handleDeleteTask()
         },
         [handleDeleteTask]
      )

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Initialize task data when task changes
      useEffect(() => {
         if (task) {
            setTaskTitle(task.title || '')
            setTaskContent(task.content || '')
            modalCard.onOpen()
         } else {
            modalCard.onClose()
         }
      }, [task])

      // Auto-save title changes with debounce
      useEffect(() => {
         if (hasTaskTitleChanged) {
            const timeoutId = setTimeout(() => handleUpdateTitle(), 500)
            return () => clearTimeout(timeoutId)
         }
      }, [hasTaskTitleChanged, handleUpdateTitle])

      // Auto-save content changes with debounce
      useEffect(() => {
         if (hasTaskContentChanged) {
            const timeoutId = setTimeout(() => handleUpdateContent(), 500)
            return () => clearTimeout(timeoutId)
         }
      }, [hasTaskContentChanged, handleUpdateContent])

      // -------------------------------------------------------------------------
      // RENDER COMPONENTS
      // -------------------------------------------------------------------------

      const renderModalOverlay = () => (
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
      )

      const renderModalHeader = () => (
         <CardHeader padding={0} display='flex' justifyContent='flex-end'>
            <Menu isLazy isOpen={modalMenu.isOpen} onClose={modalMenu.onClose}>
               <MenuButton
                  as={IconButton}
                  icon={<PiDotsThreeBold size={20} />}
                  variant='ghost'
                  size='xs'
                  colorScheme='gray'
                  color='gray.600'
                  onClick={modalMenu.onOpen}
               />
               <MenuList>
                  <MenuItem
                     icon={<PiTrash size={18} />}
                     fontSize='sm'
                     onClick={handleMenuDelete}
                  >
                     {t('btn-delete-task')}
                  </MenuItem>
               </MenuList>
            </Menu>
         </CardHeader>
      )

      const renderTaskTitle = () => (
         <FormProvider {...methods} h='fit-content' w='full'>
            <form noValidate autoComplete='on' style={{ width: '100%' }}>
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
                  onChange={handleTitleChange}
                  onBlur={handleTitleBlur}
               />
            </form>
         </FormProvider>
      )

      const renderTaskContent = () => (
         <>
            <TaskCardLabel icon={<PiNote />} text={t('label-note')} />
            <FormProvider {...methods} h='fit-content' w='full'>
               <form noValidate autoComplete='on' style={{ width: '100%' }}>
                  <MultiInput
                     name='content'
                     type='textarea'
                     variant='unstyled'
                     value={taskContent}
                     borderRadius={0}
                     onChange={handleContentChange}
                     onBlur={handleContentBlur}
                  />
               </form>
            </FormProvider>
         </>
      )

      const renderModalBody = () => (
         <CardBody h='full'>
            <VStack w='full' alignItems='flex-start' gap={5}>
               {renderTaskTitle()}
               <ProgressSelect />
               <GroupSelect />
               <ScheduleSelect />
               {renderTaskContent()}
            </VStack>
         </CardBody>
      )

      const renderModalCard = () => (
         <ScaleFade initialScale={0.9} in={modalCard.isOpen}>
            <Card
               paddingX={6}
               paddingY={4}
               borderRadius={8}
               boxShadow='xl'
               w='665px'
               maxW='80vw'
            >
               {renderModalHeader()}
               {renderModalBody()}
            </Card>
         </ScaleFade>
      )

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      if (!modalCard.isOpen) {
         return null
      }

      return (
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
            {renderModalOverlay()}
            {renderModalCard()}
         </Box>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
TaskModal.displayName = 'TaskModal'

// PropTypes validation
TaskModal.propTypes = {
   leftWidth: PropTypes.string,
   taskData: PropTypes.shape({
      task: PropTypes.object,
      _id: PropTypes.string
   }).isRequired,
   updateTaskAction: PropTypes.func.isRequired,
   deleteTaskAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectTaskModalData = createSelector(
   [(state) => state.task.task, (state) => state.page._id],
   (task, _id) => ({
      task,
      _id
   })
)
// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   taskData: selectTaskModalData(state)
})

const mapDispatchToProps = {
   updateTaskAction,
   deleteTaskAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(TaskModal)
