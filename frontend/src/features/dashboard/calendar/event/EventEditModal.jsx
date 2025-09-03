// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useState, useCallback, useMemo, useEffect } from 'react'

// Redux
import { useSelector, useDispatch } from 'react-redux'

// UI Components
import {
   Card,
   CardHeader,
   CardBody,
   Button,
   VStack,
   HStack,
   ScaleFade,
   IconButton,
   Menu,
   useDisclosure,
   MenuButton,
   MenuList,
   MenuItem,
   useToast
} from '@chakra-ui/react'

// RTK Query
import { useDeleteGoogleEventMutation, useUpdateGoogleEventMutation } from '../../../../api/calendarApi'
import { useRemoveTaskScheduleSlotMutation, useUpdateTaskBasicMutation, useUpdateTaskScheduleMutation } from '../../../../api/taskApi'
import { clearEventEditModal } from '../../../../reducers/eventSlice'

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
// REDUX SELECTORS
// =============================================================================

const selectEventData = createSelector(
   [(state) => state.event, (state) => state.pageSlice.id],
   (eventState, id) => ({
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
      puraTaskId: eventState.puraTaskId,
      puraScheduleIndex: eventState.puraScheduleIndex,
      googleEventId: eventState.googleEventId,
      pageId: id
   })
)

const selectGoogleCalendars = createSelector(
   (state) => state.calendarSlice.googleCalendars,
   (googleCalendars) => {
      // Filter out calendars that are not writable
      return googleCalendars.filter(
         (cal) => cal.accessRole === 'owner' || cal.accessRole === 'writer'
      )
   }
)

const selectTaskData = createSelector(
   [(state) => state.taskSlice.task, (state) => state.pageSlice.id],
   (task, pageId) => ({
      task,
      pageId
   })
)

const selectGoogleAccounts = createSelector(
   [(state) => state.calendarSlice.googleAccounts],
   (googleAccounts) => googleAccounts
)

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EventEditModal = React.memo(
   ({
      rightWidth = '100%'
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------

      const { t } = useReactiveTranslation()
      const toast = useToast()
      const dispatch = useDispatch()

      // Redux selectors
      const event = useSelector(selectEventData)
      const googleCalendars = useSelector(selectGoogleCalendars)
      const googleAccounts = useSelector(selectGoogleAccounts)
      const { task, pageId } = useSelector(selectTaskData)


      // RTK Query hooks
      const [deleteGoogleEvent] = useDeleteGoogleEventMutation()
      const [updateTaskBasic] = useUpdateTaskBasicMutation()
      const [updateTaskSchedule] = useUpdateTaskScheduleMutation()
      const [removeTaskScheduleSlot] = useRemoveTaskScheduleSlotMutation()
      const [updateGoogleEvent] = useUpdateGoogleEventMutation()

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
         dispatch(clearEventEditModal())
      }, [dispatch])

      const handleSave = useCallback(async () => {
         // Validate time inputs before proceeding
         const newStartTime = new Date(startTime)
         const newEndTime = new Date(endTime)

         // Check if times are valid dates
         if (isNaN(newStartTime.getTime()) || isNaN(newEndTime.getTime())) {
            toast({
               title: null,
               description: t('alert-event-invalid-time-format'),
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
               description: t('alert-event-invalid-time-range'),
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
               description: t('desc-syncing'),
               status: 'loading',
               position: 'bottom',
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
               const isCurrentTask = task && task?.id === event.puraTaskId

               // Update task title and content if changed
               if (title !== event.title || description !== event.description) {
                  await updateTaskBasic({
                     pageId: event.pageId,
                     taskId: event.puraTaskId,
                     title: title || t('placeholder-untitled'),
                     content: description
                  })
               }
               // Update task schedule slot for time changes
               await updateTaskSchedule({
                  pageId: event.pageId,
                  taskId: event.puraTaskId,
                  slotIndex: event.puraScheduleIndex,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  ...(isCurrentTask && {
                     targetEventIndex: event.puraScheduleIndex
                  })
               })
            } else if (
               event.eventType === 'google' ||
               event.eventType === 'synced'
            ) {
               const isSyncedCurrentTask =
                  event.eventType === 'synced' &&
                  task &&
                  task?.id === event.puraTaskId

               await updateGoogleEvent({
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
                  taskId: event.puraTaskId,
                  slotIndex: event.puraScheduleIndex,
                  // Add task detail parameters for synced events
                  ...(isSyncedCurrentTask && {
                     targetEventIndex: event.puraScheduleIndex
                  })
               })

               if (event.eventType === 'synced') {
                  // Update task title and content if changed
                  if (
                     title !== event.title ||
                     description !== event.description
                  ) {
                     await updateTaskBasic({
                        pageId: event.pageId,
                        taskId: event.puraTaskId,
                        title: title || t('placeholder-untitled'),
                        content: description
                     })
                  }
               }
            }
         } catch (error) {
            // empty
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
         updateTaskSchedule,
         updateTaskBasic,
         updateGoogleEvent,
         handleCloseModal,
         toast,
         t,
         task
      ])
      const handleDelete = useCallback(async () => {
         handleCloseModal()
         if (event.eventType === 'google') {
            await deleteGoogleEvent({
               eventId: event.id,
               calendarId: event.calendarId,
               accountEmail: event.accountEmail
            })
         } else {
            await removeTaskScheduleSlot({
               pageId: pageId,
               taskId: task?.id,
               slotIndex: event.puraScheduleIndex
            })
         }
      }, [
         handleCloseModal,
         deleteGoogleEvent,
         removeTaskScheduleSlot,
         event.id,
         event.calendarId,
         event.accountEmail,
         event.eventType,
         pageId,
         task?.id,
         event.puraScheduleIndex
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
                        accounts={googleAccounts.filter(
                           (acc) => acc.accountEmail === event.accountEmail
                        )} // Filter accounts by event accountEmail
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

// =============================================================================
// EXPORT
// =============================================================================

export default EventEditModal
