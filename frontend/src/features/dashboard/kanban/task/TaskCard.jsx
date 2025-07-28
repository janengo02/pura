// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// Actions
import {
   deleteTaskAction,
   updateTaskBasicInfoAction,
   showTaskModalAction
} from '../../../../actions/taskActions'

// External Libraries
import { Draggable } from '@hello-pangea/dnd'
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// UI Components
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

// Internal Components
import { MultiInput } from '../../../../components/MultiInput'

// Utils & Icons
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import { PiDotsThreeBold, PiPencilLine, PiTrash } from 'react-icons/pi'

// Schema
import { dashboardSchema as s } from '../../DashboardSchema'

// Custom Hooks
import { useHover } from '../../../../hooks/useHover'
import { useEditing } from '../../../../hooks/useEditing'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const TaskCard = React.memo(
   ({
      task,
      isNew = false,
      draggableId,
      taskIndex,
      progressColor,
      // Redux props
      _id,
      filter,
      deleteTaskAction,
      updateTaskBasicInfoAction,
      showTaskModalAction
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()
      const taskHover = useHover()
      const titleEditing = useEditing()
      const dropdownMenu = useDisclosure()

      const methods = useForm({
         resolver: yupResolver(s),
         defaultValues: {
            title: isNew ? '' : task.title
         }
      })

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Reset form whenever task.title changes or editing state changes
      useEffect(() => {
         if (titleEditing.isEditing || isNew) {
            const currentTitle = isNew ? '' : task.title
            methods.reset({
               title: currentTitle
            })
         }
      }, [task.title, titleEditing.isEditing, isNew, methods])

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      // Memoize card background color
      const cardBackgroundColor = useMemo(
         () =>
            taskHover.isHovered
               ? progressColor + '.card.hover'
               : progressColor + '.card',
         [taskHover.isHovered, progressColor]
      )

      // Memoize padding bottom calculation
      const cardPaddingBottom = useMemo(
         () => (titleEditing.isEditing || isNew ? 0 : undefined),
         [titleEditing.isEditing, isNew]
      )

      // Memoize menu button opacity
      const menuButtonOpacity = useMemo(
         () => (taskHover.isHovered || dropdownMenu.isOpen ? 1 : 0),
         [taskHover.isHovered, dropdownMenu.isOpen]
      )

      // Memoize schedule status
      const scheduleStatus = useMemo(
         () => ({
            hasSchedule: task.schedule.length > 0,
            statusText:
               task.schedule.length > 0
                  ? t('schedule_status-true')
                  : t('schedule_status-false'),
            statusColor:
               task.schedule.length > 0 ? 'text.primary' : 'danger.primary'
         }),
         [task.schedule.length, t]
      )

      // Memoize box shadow for dragging state
      const getDragBoxShadow = useCallback(
         (isDragging) => (isDragging ? 'lg' : 'sm'),
         []
      )

      // Memoize filtered tasks based on the current filter
      const hiddenTask = useMemo(() => {
         if (
            filter.name &&
            filter.name.trim() !== '' &&
            !task.title.toLowerCase().includes(filter.name.trim().toLowerCase())
         ) {
            return true
         }
         if (filter.schedule.includes('1') && task.schedule.length > 0) {
            return false
         }
         if (filter.schedule.includes('2') && task.schedule.length === 0) {
            return false
         }
         return true
      }, [filter.schedule, filter.name, task.schedule, task.title])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDeleteTask = useCallback(() => {
         const formData = {
            page_id: _id,
            task_id: task._id
         }
         deleteTaskAction(formData)
      }, [_id, task._id, deleteTaskAction])

      const handleSubmitTitle = methods.handleSubmit(async (data) => {
         const formData = {
            page_id: _id,
            task_id: task._id,
            title: data.title || t('placeholder-untitled')
         }
         await updateTaskBasicInfoAction(formData)
         titleEditing.end()
      })

      const handleShowTask = useCallback(async () => {
         const formData = {
            page_id: _id,
            task_id: task._id
         }
         await showTaskModalAction(formData)
      }, [_id, task._id, showTaskModalAction])

      const handleMouseEnter = useCallback(
         (e) => {
            e.preventDefault()
            taskHover.start()
         },
         [taskHover]
      )

      const handleMouseLeave = useCallback(
         (e) => {
            e.preventDefault()
            taskHover.end()
         },
         [taskHover]
      )

      const handleScheduleClick = useCallback(
         (e) => {
            e.preventDefault()
            handleShowTask()
         },
         [handleShowTask]
      )

      const handleSpacerClick = useCallback(
         (e) => {
            e.preventDefault()
            handleShowTask()
         },
         [handleShowTask]
      )

      const handleTitleClick = useCallback(
         (e) => {
            e.preventDefault()
            handleShowTask()
         },
         [handleShowTask]
      )

      const handleEditClick = useCallback(
         (e) => {
            e.preventDefault()
            titleEditing.start()
         },
         [titleEditing]
      )

      const handleDeleteClick = useCallback(
         (e) => {
            e.preventDefault()
            handleDeleteTask()
         },
         [handleDeleteTask]
      )

      const handleInputBlur = useCallback(
         (e) => {
            e.preventDefault()
            handleSubmitTitle()
         },
         [handleSubmitTitle]
      )

      // -------------------------------------------------------------------------
      // RENDER COMPONENTS
      // -------------------------------------------------------------------------

      const renderScheduleStatus = () => (
         <Text
            fontSize='xs'
            color={scheduleStatus.statusColor}
            onClick={handleScheduleClick}
         >
            {scheduleStatus.statusText}
         </Text>
      )

      const renderDropdownMenu = () => (
         <Menu
            isLazy
            isOpen={dropdownMenu.isOpen}
            onClose={dropdownMenu.onClose}
         >
            <MenuButton
               as={IconButton}
               icon={<PiDotsThreeBold size={18} />}
               variant='ghost'
               size='xs'
               colorScheme='gray'
               color='text.primary'
               opacity={menuButtonOpacity}
               onClick={dropdownMenu.onOpen}
            />
            <MenuList>
               <MenuItem
                  icon={<PiPencilLine size={18} />}
                  fontSize='md'
                  onClick={handleEditClick}
               >
                  {t('btn-edit-name')}
               </MenuItem>
               <MenuItem
                  icon={<PiTrash size={18} />}
                  fontSize='md'
                  color='danger.primary'
                  onClick={handleDeleteClick}
               >
                  {t('btn-delete-task')}
               </MenuItem>
            </MenuList>
         </Menu>
      )

      const renderTaskContent = () => {
         if (titleEditing.isEditing || isNew) {
            return (
               <FormProvider {...methods}>
                  <form noValidate autoComplete='on' style={{ width: '100%' }}>
                     <MultiInput
                        name='title'
                        type='textarea'
                        variant='unstyled'
                        placeholder={t('placeholder-untitled')}
                        validation={s.title}
                        fontWeight={600}
                        borderRadius={0}
                        autoFocus
                        onBlur={handleInputBlur}
                     />
                  </form>
               </FormProvider>
            )
         }

         return (
            <Text
               w='full'
               color='text.primary'
               fontWeight={600}
               onClick={handleTitleClick}
            >
               {task.title}
            </Text>
         )
      }

      // -------------------------------------------------------------------------
      // MAIN RENDER
      // -------------------------------------------------------------------------

      return (
         <Draggable draggableId={draggableId} index={taskIndex}>
            {(provided, snapshot) => (
               <Card
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  ref={provided.innerRef}
                  variant='outline'
                  boxShadow={getDragBoxShadow(snapshot.isDragging)}
                  bg={cardBackgroundColor}
                  p={2}
                  paddingBottom={cardPaddingBottom}
                  w='full'
                  marginBottom={1}
                  className={hiddenTask ? 'hidden-card' : undefined}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
               >
                  <Flex cursor='pointer'>
                     {renderScheduleStatus()}
                     <Spacer onClick={handleSpacerClick} />
                     {renderDropdownMenu()}
                  </Flex>
                  <Flex alignItems='center' overflow='hidden' cursor='pointer'>
                     {renderTaskContent()}
                  </Flex>
               </Card>
            )}
         </Draggable>
      )
   }
)

// =============================================================================
// PROPTYPES & REDUX CONNECTION
// =============================================================================

// Display name for debugging
TaskCard.displayName = 'TaskCard'

// PropTypes validation
TaskCard.propTypes = {
   task: PropTypes.object.isRequired,
   isNew: PropTypes.bool,
   draggableId: PropTypes.string.isRequired,
   taskIndex: PropTypes.number.isRequired,
   progressColor: PropTypes.string.isRequired,
   // Redux props
   _id: PropTypes.string.isRequired,
   filter: PropTypes.object.isRequired,
   updateTaskBasicInfoAction: PropTypes.func.isRequired,
   deleteTaskAction: PropTypes.func.isRequired,
   showTaskModalAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   _id: state.page._id,
   filter: state.page.filter
})

const mapDispatchToProps = {
   updateTaskBasicInfoAction,
   deleteTaskAction,
   showTaskModalAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(TaskCard)
