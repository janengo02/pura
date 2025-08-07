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
   useToast
} from '@chakra-ui/react'

// Actions
import {
   deleteGoogleEventAction,
   updateGoogleEventAction
} from '../../../../actions/calendarActions'
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
import { EventCalendarSelect } from './EventCalendarInfo'
import { EventConferenceInput } from './EventConference'
import { GOOGLE_CALENDAR_COLORS } from '../../../../components/data/defaultColor'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EventEditModal = React.memo(
   ({
      rightWidth = '100%',
      // Redux props
      event,
      googleCalendars,
      taskData: { task },

      updateGoogleEventAction,
      updateTaskScheduleAction,
      updateTaskBasicInfoAction,
      clearEventEditModalAction,
      deleteGoogleEventAction
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------

      const { t } = useReactiveTranslation()
      const toast = useToast()

      // -------------------------------------------------------------------------
      // STATE
      // -------------------------------------------------------------------------

      const [startTime, setStartTime] = useState(() =>
         stringToDateTimeLocal(event.start)
      )
      const [endTime, setEndTime] = useState(() =>
         stringToDateTimeLocal(event.end)
      )
      const [title, setTitle] = useState('')
      const [description, setDescription] = useState('')
      const [selectedCalendar, setSelectedCalendar] = useState({})
      const [selectedColorId, setSelectedColorId] = useState(null)
      const [conferenceData, setConferenceData] = useState(null)
      const modalMenu = useDisclosure()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------
      const isModalOpen = useMemo(() => Boolean(event.id), [event.id])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------
      const handleCloseModal = useCallback(() => {
         // Clear the task from Redux state to close modal
         clearEventEditModalAction()
      }, [clearEventEditModalAction])

      const handleSave = useCallback(async () => {
         // Validate time inputs before proceeding
         const newStartTime = new Date(startTime)
         const newEndTime = new Date(endTime)

         // Check if times are valid dates
         if (isNaN(newStartTime.getTime()) || isNaN(newEndTime.getTime())) {
            toast({
               title: null,
               description: t('event-invalid-time-format'),
               status: 'error',
               duration: 5000,
               isClosable: true
            })
            return
         }

         // Check if start time is before end time
         if (newStartTime >= newEndTime) {
            toast({
               title: null,
               description: t('event-invalid-time-range'),
               status: 'error',
               duration: 5000,
               isClosable: true
            })
            return
         }

         handleCloseModal()

         // Show loading toast for task and synced events
         let loadingToast = null
         if (event.eventType === 'task' || event.eventType === 'synced') {
            loadingToast = toast({
               title: null,
               description: t('syncing'),
               status: 'loading',
               duration: null, // Keep it open until we close it
               isClosable: false
            })
         }

         try {
            // Set seconds and milliseconds to 0 for consistency
            newStartTime.setSeconds(0, 0)
            newEndTime.setSeconds(0, 0)

            // Update based on event type
            if (event.eventType === 'task') {
               const isCurrentTask = task && task._id === event.pura_task_id

               // Update task title and content if changed
               if (title !== event.title || description !== event.description) {
                  await updateTaskBasicInfoAction({
                     page_id: event.pageId,
                     task_id: event.pura_task_id,
                     title: title || t('placeholder-untitled'),
                     content: description
                  })
               }
               // Update task schedule slot for time changes
               await updateTaskScheduleAction({
                  page_id: event.pageId,
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  ...(isCurrentTask && {
                     task_detail_flg: true,
                     target_event_index: event.pura_schedule_index
                  })
               })
            } else if (
               event.eventType === 'google' ||
               event.eventType === 'synced'
            ) {
               const isSyncedCurrentTask =
                  event.eventType === 'synced' &&
                  task &&
                  task._id === event.pura_task_id

               await updateGoogleEventAction({
                  eventId: event.id,
                  originalCalendarId: event.calendarId,
                  calendarId: selectedCalendar.calendarId || event.calendarId,
                  accountEmail: event.accountEmail,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  summary: title || t('placeholder-untitled'),
                  description: description,
                  colorId: selectedColorId,
                  conferenceData: conferenceData,
                  calendarSummary: selectedCalendar.title,
                  calendarBackgroundColor: selectedCalendar.color,
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  // Add task detail parameters for synced events
                  ...(isSyncedCurrentTask && {
                     task_detail_flg: true,
                     target_event_index: event.pura_schedule_index
                  })
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
                        title: title || t('placeholder-untitled'),
                        content: description
                     })
                  }
               }
            }
         } catch (error) {
            console.error('Error updating event:', error)
         } finally {
            // Remove loading toast
            if (loadingToast) {
               toast.close(loadingToast)
            }
         }
      }, [
         startTime,
         endTime,
         title,
         description,
         selectedCalendar,
         selectedColorId,
         conferenceData,
         event,
         updateTaskScheduleAction,
         updateTaskBasicInfoAction,
         updateGoogleEventAction,
         handleCloseModal,
         toast,
         t,
         task
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
            setSelectedCalendar(
               googleCalendars.find(
                  (cal) => cal.calendarId === event.calendarId
               ) || {
                  calendarId: event.calendarId || '',
                  title: '',
                  accountEmail: event.accountEmail || '',
                  accessRole: '',
                  color: ''
               }
            )
            const foundColor = Object.entries(GOOGLE_CALENDAR_COLORS).find(
               ([, hex]) => hex === event.color
            )
            setSelectedColorId(foundColor ? foundColor[0] : null)
            setConferenceData(event.conferenceData || null)
         }
      }, [event, googleCalendars])

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
                  icon={<PiX size={18} />}
                  variant='ghost'
                  onClick={handleCloseModal}
               />
               <EventTitleInput title={title} setTitle={setTitle} />
               <Button colorScheme='blue' size='md' onClick={handleSave}>
                  {t('btn-save')}
               </Button>
               <Menu
                  isLazy
                  isOpen={modalMenu.isOpen}
                  onClose={modalMenu.onClose}
               >
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
            <VStack w='full' alignItems='flex-start' spacing={3}>
               <EventTimeInput
                  startTime={startTime}
                  setStartTime={setStartTime}
                  endTime={endTime}
                  setEndTime={setEndTime}
               />

               {/* Calendar selection for google and synced events */}
               {(event.eventType === 'google' ||
                  event.eventType === 'synced') && (
                  <>
                     <EventCalendarSelect
                        selectedCalendar={selectedCalendar}
                        setSelectedCalendar={setSelectedCalendar}
                        selectedColorId={selectedColorId}
                        setSelectedColorId={setSelectedColorId}
                        calendars={googleCalendars || []}
                        accountEmail={event.accountEmail}
                     />
                     <EventConferenceInput
                        conferenceData={conferenceData}
                        setConferenceData={setConferenceData}
                        accountEmail={event.accountEmail}
                     />
                  </>
               )}
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
      conferenceData: PropTypes.shape({
         type: PropTypes.string,
         id: PropTypes.string,
         joinUrl: PropTypes.string,
         phoneNumbers: PropTypes.array
      }),
      eventType: PropTypes.oneOf(['task', 'google', 'synced']),
      calendarId: PropTypes.string,
      accountEmail: PropTypes.string,
      pura_task_id: PropTypes.string,
      pura_schedule_index: PropTypes.number,
      google_event_id: PropTypes.string,
      pageId: PropTypes.string
   }).isRequired,
   googleCalendars: PropTypes.arrayOf(
      PropTypes.shape({
         calendarId: PropTypes.string,
         title: PropTypes.string,
         accountEmail: PropTypes.string,
         accessRole: PropTypes.string,
         color: PropTypes.string
      })
   ).isRequired,
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
      conferenceData: eventState.conferenceData,
      eventType: eventState.eventType,
      calendarId: eventState.calendarId,
      accountEmail: eventState.accountEmail,
      pura_task_id: eventState.pura_task_id,
      pura_schedule_index: eventState.pura_schedule_index,
      google_event_id: eventState.google_event_id,
      pageId: _id
   })
)

const selectGoogleCalendars = createSelector(
   (state) => state.calendar.googleCalendars,
   (googleCalendars) => {
      // Filter out calendars that are not writable
      return googleCalendars.filter(
         (cal) => cal.accessRole === 'owner' || cal.accessRole === 'writer'
      )
   }
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
   googleCalendars: selectGoogleCalendars(state),
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
