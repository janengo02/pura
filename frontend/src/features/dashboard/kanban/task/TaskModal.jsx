// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'

// Rich Text Editor
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.bubble.css'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import {
   clearTaskAction,
   deleteTaskAction,
   updateTaskBasicInfoAction
} from '../../../../actions/taskActions'

// Form Handling
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { dashboardSchema as s } from '../../DashboardSchema'

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
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import { NAVBAR_HEIGHT } from '../../Navbar'

// =============================================================================
// CONSTANTS & UTILITIES
// =============================================================================
const FOCUS_DELAY = 100 // Delay before focusing to ensure modal is fully rendered

// Utility function to decode HTML entities (handles multiple levels of encoding)
const decodeHtmlEntities = (str) => {
   if (!str || typeof str !== 'string') return ''

   let decoded = str
   let prevDecoded = ''

   // Keep decoding until no more changes occur (handles multiple levels of encoding)
   while (decoded !== prevDecoded) {
      prevDecoded = decoded
      const textarea = document.createElement('textarea')
      textarea.innerHTML = decoded
      decoded = textarea.value
   }

   return decoded
}

// Utility function to check if content is empty ReactQuill content
const isEmptyQuillContent = (content) => {
   if (!content) return true

   // Common empty ReactQuill patterns
   const emptyPatterns = [
      '<p><br></p>',
      '<p></p>',
      '<br>',
      '<div><br></div>',
      '<div></div>'
   ]

   if (emptyPatterns.includes(content.trim())) return true

   // Remove all HTML tags and check if there's meaningful text left
   const textContent = content.replace(/<[^>]*>/g, '').trim()
   return !textContent
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const TaskModal = React.memo(
   ({
      leftWidth = '100%',

      // Redux props
      taskData: { task, id },
      deleteTaskAction,
      updateTaskBasicInfoAction,
      clearTaskAction
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------

      const { t } = useReactiveTranslation()

      // Modal state management
      const modalMenu = useDisclosure()

      // Form setup
      const methods = useForm({
         resolver: yupResolver(s),
         mode: 'onChange'
      })

      // Local state for optimistic updates
      const [taskTitle, setTaskTitle] = useState('')
      const [taskContent, setTaskContent] = useState('')

      // Ref for title input focus
      const titleInputRef = useRef(null)
      const previousTaskIdRef = useRef(null)
      const quillRef = useRef(null)

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------
      // Memoized modal state based on task existence
      const isModalOpen = useMemo(() => Boolean(task), [task])

      const hasTaskTitleChanged = useMemo(
         () => taskTitle && taskTitle !== task?.title,
         [taskTitle, task?.title]
      )

      const hasTaskContentChanged = useMemo(
         () => taskContent !== task?.content,
         [taskContent, task?.content]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDeleteTask = useCallback(() => {
         if (!task?.id) return
         const formData = {
            pageId: id,
            taskId: task?.id
         }
         deleteTaskAction(formData)
      }, [id, task?.id, deleteTaskAction])

      const handleUpdateTitle = useCallback(async () => {
         if (!task?.id) return
         const formData = {
            pageId: id,
            taskId: task?.id,
            title: taskTitle || t('placeholder-untitled')
         }
         await updateTaskBasicInfoAction(formData)
      }, [id, task?.id, taskTitle, updateTaskBasicInfoAction, t])

      const handleUpdateContent = useCallback(async () => {
         if (!task?.id) return
         // Clean the content before sending to API
         const cleanContent = isEmptyQuillContent(taskContent)
            ? ''
            : taskContent
         const formData = {
            pageId: id,
            taskId: task?.id,
            content: cleanContent
         }
         await updateTaskBasicInfoAction(formData)
      }, [id, task?.id, taskContent, updateTaskBasicInfoAction])

      const handleTitleChange = useCallback((e) => {
         e.preventDefault()
         setTaskTitle(e.target.value)
      }, [])

      const handleTitleBlur = useCallback((e) => {
         e.preventDefault()
         setTaskTitle(e.target.value)
      }, [])

      const handleContentChange = useCallback((content) => {
         // Sanitize content to prevent double encoding
         const sanitizedContent = isEmptyQuillContent(content) ? '' : content
         setTaskContent(sanitizedContent)
      }, [])

      // Handle keyboard events to catch delete operations
      useEffect(() => {
         if (!isModalOpen || !quillRef.current) return

         const handleKeyUp = (e) => {
            // Check for delete/backspace keys
            if (e.key === 'Backspace' || e.key === 'Delete') {
               setTimeout(() => {
                  const quillEditor = quillRef.current?.getEditor()
                  if (quillEditor) {
                     const content = quillEditor.root.innerHTML
                     const sanitizedContent = isEmptyQuillContent(content)
                        ? ''
                        : content

                     if (sanitizedContent !== taskContent) {
                        setTaskContent(sanitizedContent)
                     }
                  }
               }, 10) // Small delay to ensure DOM is updated
            }
         }

         // Add event listener to the Quill editor
         const quillEditor = quillRef.current?.getEditor()
         if (quillEditor) {
            quillEditor.root.addEventListener('keyup', handleKeyUp)
            return () => {
               quillEditor.root.removeEventListener('keyup', handleKeyUp)
            }
         }
      }, [isModalOpen, taskContent])

      const handleMenuDelete = useCallback(
         async (e) => {
            e.preventDefault()
            handleDeleteTask()
            // Modal will close automatically when task is deleted from Redux
         },
         [handleDeleteTask]
      )

      const handleCloseModal = useCallback(() => {
         // Clear the task from Redux state to close modal
         clearTaskAction()
      }, [clearTaskAction])
      // -------------------------------------------------------------------------
      // FOCUS MANAGEMENT
      // -------------------------------------------------------------------------

      const focusTitleInput = useCallback(() => {
         // Use a small delay to ensure the modal and form are fully rendered
         setTimeout(() => {
            if (titleInputRef.current) {
               titleInputRef.current.focus()
               // Position cursor at the end of existing text
               const length = titleInputRef.current.value.length
               titleInputRef.current.setSelectionRange(length, length)
            }
         }, FOCUS_DELAY)
      }, [])

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Initialize task data when task changes
      useEffect(() => {
         if (task) {
            setTaskTitle(task.title || '')
            // Decode HTML entities to prevent double encoding
            const decodedContent = decodeHtmlEntities(task.content || '')
            setTaskContent(
               isEmptyQuillContent(decodedContent) ? '' : decodedContent
            )
         }
      }, [task])

      // Focus title input only when modal first opens (new task selected)
      useEffect(() => {
         const currentTaskId = task?.id
         const previousTaskId = previousTaskIdRef.current

         // Only focus if modal is open, task exists, and task ID has changed
         if (isModalOpen && task && currentTaskId !== previousTaskId) {
            focusTitleInput()
         }

         // Update the previous task ID ref
         previousTaskIdRef.current = currentTaskId
      }, [isModalOpen, task, focusTitleInput])

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
            h='full'
            left={0}
            bg='text.primary'
            opacity={0.3}
            onClick={handleCloseModal}
         />
      )

      const renderModalHeader = () => (
         <CardHeader padding={0} display='flex' justifyContent='flex-end'>
            <Menu isLazy isOpen={modalMenu.isOpen} onClose={modalMenu.onClose}>
               <MenuButton
                  as={IconButton}
                  icon={<PiDotsThreeBold size={18} />}
                  variant='ghost'
                  size='md'
                  colorScheme='gray'
                  color='text.primary'
                  onClick={modalMenu.onOpen}
               />
               <MenuList>
                  <MenuItem
                     icon={<PiTrash size={18} />}
                     fontSize='md'
                     color='danger.primary'
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
                  ref={titleInputRef}
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
            <TaskCardLabel icon={<PiNote size={18} />} text={t('label-note')} />
            <Box
               w='full'
               sx={{
                  '& .ql-editor.ql-blank::before': {
                     color: 'text.secondary',
                     opacity: 0.7,
                     fontStyle: 'italic'
                  },
                  '& .ql-editor': {
                     padding: '8px 0',
                     fontSize: '14px',
                     lineHeight: '1.5'
                  }
               }}
            >
               <ReactQuill
                  ref={quillRef}
                  theme='bubble'
                  value={taskContent}
                  onChange={handleContentChange}
                  placeholder={t('placeholder-add-note')}
                  style={{
                     width: '100%',
                     minHeight: '100px'
                  }}
                  formats={[
                     'bold',
                     'italic',
                     'underline',
                     'strike',
                     'list',
                     'bullet',
                     'indent',
                     'link'
                  ]}
                  modules={{
                     toolbar: [
                        ['bold', 'italic', 'underline'],
                        [{ list: 'ordered' }, { list: 'bullet' }],
                        ['link']
                     ]
                  }}
               />
            </Box>
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
         <ScaleFade initialScale={0.9} in={isModalOpen}>
            <Card
               paddingX={6}
               paddingY={4}
               borderRadius={8}
               boxShadow='xl'
               w='800px'
            >
               {renderModalHeader()}
               {renderModalBody()}
            </Card>
         </ScaleFade>
      )

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      if (!isModalOpen) {
         return null
      }
      return (
         <Box
            position='fixed'
            w={leftWidth}
            h='full'
            top={NAVBAR_HEIGHT}
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
      id: PropTypes.string
   }).isRequired,
   updateTaskBasicInfoAction: PropTypes.func.isRequired,
   deleteTaskAction: PropTypes.func.isRequired,
   clearTaskAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectTaskModalData = createSelector(
   [(state) => state.task.task, (state) => state.page.id],
   (task, id) => ({
      task,
      id
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   taskData: selectTaskModalData(state)
})

const mapDispatchToProps = {
   updateTaskBasicInfoAction,
   deleteTaskAction,
   clearTaskAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(TaskModal)
