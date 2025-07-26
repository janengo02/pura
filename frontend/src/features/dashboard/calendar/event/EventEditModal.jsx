// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// UI Components
import {
   Card,
   CardHeader,
   CardBody,
   Button,
   Input,
   VStack,
   HStack,
   Box,
   ScaleFade,
   IconButton,
   Menu,
   useDisclosure,
   MenuButton,
   MenuList,
   MenuItem,
   Textarea
} from '@chakra-ui/react'

// Actions
import {
   deleteGoogleEventAction,
   updateGoogleEventAction
} from '../../../../actions/googleAccountActions'
import {
   showTaskModalAction,
   updateTaskScheduleAction,
   updateTaskBasicInfoAction
} from '../../../../actions/taskActions'
import { clearEventEditModalAction } from '../../../../actions/eventActions'

// Utils
import { stringToDateTimeLocal } from '../../../../utils/dates'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import { createSelector } from 'reselect'
import { NAVBAR_HEIGHT } from '../../Navbar'
import { PiDotsThreeBold, PiTrash, PiX } from 'react-icons/pi'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EventEditModal = React.memo(
   ({
      rightWidth = '100%',
      // Redux props
      event,
      taskData: { task, pageId },

      updateGoogleEventAction,
      updateTaskScheduleAction,
      updateTaskBasicInfoAction,
      clearEventEditModalAction,
      showTaskModalAction,
      deleteGoogleEventAction
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------

      const { t } = useReactiveTranslation()

      // -------------------------------------------------------------------------
      // STATE
      // -------------------------------------------------------------------------

      const [startTime, setStartTime] = useState(() =>
         stringToDateTimeLocal(event.start)
      )
      const [endTime, setEndTime] = useState(() =>
         stringToDateTimeLocal(event.end)
      )
      const [title, setTitle] = useState(event.title || '')
      const modalMenu = useDisclosure()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------
      const isModalOpen = useMemo(() => Boolean(event.id), [event.id])

      const isTimeValid = useMemo(() => {
         if (!startTime || !endTime) return false
         const start = new Date(startTime)
         const end = new Date(endTime)
         return start < end && !isNaN(start.getTime()) && !isNaN(end.getTime())
      }, [startTime, endTime])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const refetchTaskModalIfOpen = useCallback(async () => {
         // Check if task modal is displayed (task exists in state)
         if (task && pageId) {
            const formData = {
               page_id: pageId,
               task_id: task._id,
               target_event_index: event.pura_schedule_index
            }
            await showTaskModalAction(formData)
         }
      }, [task, pageId, showTaskModalAction, event.pura_schedule_index])

      const handleStartTimeChange = useCallback((e) => {
         setStartTime(e.target.value)
      }, [])

      const handleEndTimeChange = useCallback((e) => {
         setEndTime(e.target.value)
      }, [])

      const handleTitleChange = useCallback((e) => {
         setTitle(e.target.value)
      }, [])

      const handleCloseModal = useCallback(() => {
         // Clear the task from Redux state to close modal
         clearEventEditModalAction()
      }, [clearEventEditModalAction])

      const handleSave = useCallback(async () => {
         if (!isTimeValid) return

         try {
            const newStartTime = new Date(startTime)
            const newEndTime = new Date(endTime)

            // Set seconds and milliseconds to 0 for consistency
            newStartTime.setSeconds(0, 0)
            newEndTime.setSeconds(0, 0)

            const timeUpdates = {
               start: newStartTime.toISOString(),
               end: newEndTime.toISOString()
            }

            // Update based on event type
            if (event.eventType === 'task' || event.eventType === 'synced') {
               // Update task schedule slot for time changes
               await updateTaskScheduleAction({
                  page_id: event.pageId,
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  ...timeUpdates
               })

               // Update task title if changed
               if (title !== event.title) {
                  await updateTaskBasicInfoAction({
                     page_id: event.pageId,
                     task_id: event.pura_task_id,
                     title: title
                  })
               }
            } else if (event.eventType === 'google') {
               // Update Google event with both time and title
               await updateGoogleEventAction({
                  eventId: event.id,
                  calendarId: event.calendarId,
                  accountEmail: event.accountEmail,
                  summary: title,
                  ...timeUpdates
               })
            }
            await refetchTaskModalIfOpen()
            handleCloseModal()
         } catch (error) {
            console.error('Error updating event:', error)
         }
      }, [
         isTimeValid,
         startTime,
         endTime,
         title,
         event,
         updateTaskScheduleAction,
         updateTaskBasicInfoAction,
         updateGoogleEventAction,
         handleCloseModal,
         refetchTaskModalIfOpen
      ])
      const handleDelete = useCallback(async () => {
         const reqData = {
            eventId: event.id,
            calendarId: event.calendarId,
            accountEmail: event.accountEmail
         }
         await deleteGoogleEventAction(reqData)
      }, [
         deleteGoogleEventAction,
         event.id,
         event.calendarId,
         event.accountEmail
      ])
      // -------------------------------------------------------------------------
      // LOADING HOOKS
      // -------------------------------------------------------------------------

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Initialize task data when task changes
      useEffect(() => {
         if (event) {
            setStartTime(stringToDateTimeLocal(event.start))
            setEndTime(stringToDateTimeLocal(event.end))
            setTitle(event.title || '')
         }
      }, [event])

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      const renderModalHeader = () => (
         <CardHeader
            padding={0}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
            w='full'
         >
            <HStack spacing={2} w='full'>
               <IconButton
                  icon={<PiX />}
                  variant='ghost'
                  borderRadius='full'
                  onClick={handleCloseModal}
               />

               <Textarea
                  value={title}
                  onChange={handleTitleChange}
                  fontSize='lg'
                  fontWeight='semibold'
                  flexGrow={1}
                  variant='flushed'
                  resize='none'
                  minH='auto'
                  rows={1}
                  placeholder='Event title'
               />
               <Button
                  colorScheme='blue'
                  borderRadius='full'
                  onClick={handleSave}
                  isDisabled={!isTimeValid}
               >
                  {t('btn-save')}
               </Button>
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
                     color='text.primary'
                     onClick={modalMenu.onOpen}
                  />
                  <MenuList>
                     <MenuItem
                        icon={<PiTrash size={18} />}
                        fontSize='sm'
                        color='danger.primary'
                        onClick={async (e) => {
                           e.preventDefault()
                           await handleDelete()
                           handleCloseModal()
                        }}
                     >
                        {t('btn-delete-event')}
                     </MenuItem>
                  </MenuList>
               </Menu>
            </HStack>
         </CardHeader>
      )
      const timeInputProps = useMemo(
         () => ({
            size: 'sm',
            type: 'datetime-local',
            variant: 'filled',
            width: 'auto',
            fontSize: 'xs',
            borderRadius: 5
         }),
         []
      )

      const startTimeInput = useMemo(
         () => (
            <Input
               {...timeInputProps}
               value={startTime}
               onChange={handleStartTimeChange}
            />
         ),
         [startTime, handleStartTimeChange, timeInputProps]
      )
      const endTimeInput = useMemo(
         () => (
            <Input
               {...timeInputProps}
               value={endTime}
               onChange={handleEndTimeChange}
            />
         ),
         [endTime, handleEndTimeChange, timeInputProps]
      )

      const renderModalBody = () => (
         <CardBody h='full'>
            <VStack
               w='full'
               alignItems='flex-start'
               spacing={2}
               color={isTimeValid ? undefined : 'danger.secondary'}
            >
               <Box spacing={2} w='full'>
                  {startTimeInput} - {endTimeInput}
               </Box>
            </VStack>
         </CardBody>
      )

      if (!isModalOpen) {
         return null
      }

      return (
         <ScaleFade initialScale={0.9} in={isModalOpen}>
            <Card
               paddingY={6}
               paddingX={4}
               borderRadius={0}
               w={rightWidth}
               h='full'
               position='fixed'
               top={NAVBAR_HEIGHT}
               right={0}
            >
               {renderModalHeader()}
               {renderModalBody()}
            </Card>
         </ScaleFade>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
EventEditModal.displayName = 'EventEditModal'

// PropTypes validation
EventEditModal.propTypes = {
   rightWidth: PropTypes.string,
   event: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
         .isRequired,
      end: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      eventType: PropTypes.oneOf(['task', 'google', 'synced']).isRequired,
      calendarId: PropTypes.string,
      accountEmail: PropTypes.string,
      pura_task_id: PropTypes.string,
      pura_schedule_index: PropTypes.number,
      pageId: PropTypes.string
   }).isRequired,
   taskData: PropTypes.shape({
      task: PropTypes.object,
      pageId: PropTypes.string
   }).isRequired,
   updateGoogleEventAction: PropTypes.func.isRequired,
   updateTaskBasicInfoAction: PropTypes.func.isRequired,
   clearEventEditModalAction: PropTypes.func.isRequired,
   updateTaskScheduleAction: PropTypes.func.isRequired,
   showTaskModalAction: PropTypes.func.isRequired,
   deleteGoogleEventAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectEventData = createSelector(
   [(state) => state.event, (state) => state.page._id],
   (eventState, _id) => ({
      id: eventState.id,
      title: eventState.title,
      start: eventState.start,
      end: eventState.end,
      eventType: eventState.eventType,
      calendarId: eventState.calendarId,
      accountEmail: eventState.accountEmail,
      pura_task_id: eventState.pura_task_id,
      pura_schedule_index: eventState.pura_schedule_index,
      pageId: _id
   })
)

const selectTaskData = createSelector(
   [(state) => state.task.task, (state) => state.page._id],
   (task, pageId) => ({
      task,
      pageId
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   event: selectEventData(state),
   taskData: selectTaskData(state)
})

const mapDispatchToProps = {
   updateGoogleEventAction,
   updateTaskScheduleAction,
   updateTaskBasicInfoAction,
   clearEventEditModalAction,
   showTaskModalAction,
   deleteGoogleEventAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(EventEditModal)
