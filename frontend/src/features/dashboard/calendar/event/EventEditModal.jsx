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
   Circle,
   Text,
   Flex,
   SimpleGrid
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
import { EventTimeInput } from './EventTime'
import { EventDescriptionInput } from './EventDescription'
import { EventTitleInput } from './EventTitle'

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
      const [description, setDescription] = useState(event.description || '')
      const modalMenu = useDisclosure()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------
      const isModalOpen = useMemo(() => Boolean(event.id), [event.id])

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

      const handleCloseModal = useCallback(() => {
         // Clear the task from Redux state to close modal
         clearEventEditModalAction()
      }, [clearEventEditModalAction])

      const handleSave = useCallback(async () => {
         // @todo: Validate time inputs before proceeding
         handleCloseModal()

         try {
            const newStartTime = new Date(startTime)
            const newEndTime = new Date(endTime)

            // Set seconds and milliseconds to 0 for consistency
            newStartTime.setSeconds(0, 0)
            newEndTime.setSeconds(0, 0)

            // Update based on event type
            if (event.eventType === 'task') {
               // Update task schedule slot for time changes
               await updateTaskScheduleAction({
                  page_id: event.pageId,
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString()
               })

               // Update task title and content if changed
               if (title !== event.title || description !== event.description) {
                  await updateTaskBasicInfoAction({
                     page_id: event.pageId,
                     task_id: event.pura_task_id,
                     title: title,
                     content: description
                  })
               }
            } else if (
               event.eventType === 'google' ||
               event.eventType === 'synced'
            ) {
               await updateGoogleEventAction({
                  eventId: event.id,
                  calendarId: event.calendarId,
                  accountEmail: event.accountEmail,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  summary: title,
                  description: description
               })

               if (event.eventType === 'synced') {
                  // Update task title and content if changed
                  if (
                     title !== event.title ||
                     description !== event.description
                  ) {
                     await updateTaskBasicInfoAction({
                        page_id: event.pageId,
                        task_id: event.pura_task_id,
                        title: title,
                        content: description
                     })
                  }
               }
            }
            await refetchTaskModalIfOpen()
         } catch (error) {
            console.error('Error updating event:', error)
         }
      }, [
         startTime,
         endTime,
         title,
         description,
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

      // Initialize event data when event changes
      useEffect(() => {
         if (event) {
            setStartTime(stringToDateTimeLocal(event.start))
            setEndTime(stringToDateTimeLocal(event.end))
            setTitle(event.title || '')
            setDescription(event.description || '')
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
            <HStack spacing={3} w='full'>
               <IconButton
                  icon={<PiX />}
                  variant='ghost'
                  borderRadius='full'
                  onClick={handleCloseModal}
               />
               <EventTitleInput title={title} setTitle={setTitle} />
               <Button
                  colorScheme='blue'
                  borderRadius='full'
                  onClick={handleSave}
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

      const renderModalBody = () => (
         <CardBody h='full'>
            <VStack w='full' alignItems='flex-start' spacing={2}>
               <EventTimeInput
                  startTime={startTime}
                  setStartTime={setStartTime}
                  endTime={endTime}
                  setEndTime={setEndTime}
               />
               <EventDescriptionInput
                  description={description}
                  setDescription={setDescription}
               />
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
      id: PropTypes.string,
      title: PropTypes.string,
      description: PropTypes.string,
      color: PropTypes.string,
      start: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      end: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
      eventType: PropTypes.oneOf(['task', 'google', 'synced']),
      calendarId: PropTypes.string,
      accountEmail: PropTypes.string,
      pura_task_id: PropTypes.string,
      pura_schedule_index: PropTypes.number,
      google_event_id: PropTypes.string,
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
      description: eventState.description,
      color: eventState.color,
      start: eventState.start,
      end: eventState.end,
      eventType: eventState.eventType,
      calendarId: eventState.calendarId,
      accountEmail: eventState.accountEmail,
      pura_task_id: eventState.pura_task_id,
      pura_schedule_index: eventState.pura_schedule_index,
      google_event_id: eventState.google_event_id,
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
