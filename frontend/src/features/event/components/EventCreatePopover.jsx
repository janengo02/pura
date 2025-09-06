// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import { useCallback, useEffect, useMemo, useState } from 'react'

// UI Components
import {
   PopoverContent,
   VStack,
   Button,
   HStack,
   Popover,
   PopoverTrigger,
   Box,
   PopoverHeader,
   PopoverBody,
   IconButton
} from '@chakra-ui/react'

// Utils
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'
import { updateNewEvent, clearCalendarEvent } from '../../calendar/calendarSlice'
import { useDispatch, useSelector } from 'react-redux'
import { createSelector } from 'reselect'
import { useCreateGoogleEventMutation } from '../../calendar/api/calendarApi'
import { POPOVER_STYLES } from '../../calendar/components/Calendar'
import {
   POPOVER_BODY_STYLES,
   POPOVER_CONTENT_STYLES,
   POPOVER_HEADER_STYLES
} from './EventPreview'
import { EventTimeInput } from './EventTime'
import { EventDescriptionInput } from './EventDescription'
import { EventTitleInput } from './EventTitle'
import { EventCalendarSelect } from './EventCalendarInfo'
import { stringToDateTimeLocal } from '../../../shared/utils/dates'
import { PiX } from 'react-icons/pi'
import { GOOGLE_CALENDAR_COLORS } from '../../../shared/constants/defaultColor'

// =============================================================================
// SELECTORS
// =============================================================================

const selectNewEvent = createSelector(
   [state => state.calendarSlice.googleEvents],
   (events) => events.find(event => event.id === 'new')
)

const selectGoogleAccounts = createSelector(
   [state => state.calendarSlice.googleAccounts],
   (accounts) => accounts
)

const selectWritableCalendars = createSelector(
   [state => state.calendarSlice.googleCalendars],
   (calendars) => calendars.filter(
      cal => cal.accessRole === 'owner' || cal.accessRole === 'writer'
   )
)

// =============================================================================
// COMPONENT
// =============================================================================

const EventCreatePopover = () => {
   // -------------------------------------------------------------------------
   // HOOKS
   // -------------------------------------------------------------------------
   const { t } = useReactiveTranslation()
   const dispatch = useDispatch()
   const [createGoogleEvent, {isLoading: isCreatingGoogleEvent}] = useCreateGoogleEventMutation()

   // Redux selectors
   const newEvent = useSelector(selectNewEvent)
   const googleAccounts = useSelector(selectGoogleAccounts)
   const googleCalendars = useSelector(selectWritableCalendars)

   // -------------------------------------------------------------------------
   // REFS & STATE
   // -------------------------------------------------------------------------
   const [eventTitle, setEventTitle] = useState('')
   const [eventDescription, setEventDescription] = useState('')
   const [startTime, setStartTime] = useState('')
   const [endTime, setEndTime] = useState('')
   const [selectedCalendar, setSelectedCalendar] = useState({})
   const [selectedColorId, setSelectedColorId] = useState(null)

   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------
   // Memoized modal state based on task existence
   const isInputingNewEvent = useMemo(() => Boolean(newEvent), [newEvent])
   const isTimeValid = useMemo(() => {
      if (!startTime || !endTime) return false
      const startDate = new Date(startTime)
      const endDate = new Date(endTime)

      // Check if times are valid dates
      if (
         isNaN(startDate.getTime()) ||
         isNaN(endDate.getTime()) ||
         startDate >= endDate
      ) {
         return false
      }
      return true
   }, [startTime, endTime])
   const isEventValid = useMemo(() => {
      return (
         newEvent &&
         isTimeValid &&
         selectedCalendar.calendarId &&
         selectedCalendar.accountEmail
      )
   }, [newEvent, isTimeValid, selectedCalendar])
   const hasEventTitleChanged = useMemo(
      () => eventTitle && eventTitle !== newEvent?.title,
      [eventTitle, newEvent?.title]
   )
   const hasEventDescriptionChanged = useMemo(
      () => eventDescription !== newEvent?.description,
      [eventDescription, newEvent?.description]
   )

   const hasEventTimeChanged = useMemo(() => {
      if (!newEvent) return false
      const originalStartTime = newEvent.start
         ? stringToDateTimeLocal(newEvent.start)
         : ''
      const originalEndTime = newEvent.end
         ? stringToDateTimeLocal(newEvent.end)
         : ''

      return (
         (startTime && startTime !== originalStartTime) ||
         (endTime && endTime !== originalEndTime)
      )
   }, [startTime, endTime, newEvent])

   const hasEventCalendarChanged = useMemo(() => {
      if (!newEvent || !selectedCalendar.calendarId) return false
      return selectedCalendar.calendarId !== newEvent.calendarId
   }, [selectedCalendar.calendarId, newEvent])

   const hasEventColorChanged = useMemo(() => {
      if (!newEvent) return false
      const currentColorId =
         Object.entries(GOOGLE_CALENDAR_COLORS).find(
            ([, hex]) => hex === newEvent.color
         )?.[0] || null
      return selectedColorId !== currentColorId
   }, [selectedColorId, newEvent])

   // -------------------------------------------------------------------------
   // HANDLERS
   // -------------------------------------------------------------------------
   const handleOnClose = useCallback(() => {
      dispatch(clearCalendarEvent())
   }, [dispatch])
   const handleUpdateCalendarEvent = useCallback(() => {
      if (!isEventValid) return

      const updatedEvent = {
         ...newEvent,
         summary: eventTitle,
         description: eventDescription,
         calendarId: selectedCalendar.calendarId || newEvent?.calendarId,
         accountEmail: selectedCalendar.accountEmail || newEvent?.accountEmail,
         colorId: selectedColorId,
         start: startTime
            ? { dateTime: new Date(startTime).toISOString() }
            : newEvent?.start
            ? { dateTime: newEvent.start }
            : undefined,
         end: endTime
            ? { dateTime: new Date(endTime).toISOString() }
            : newEvent?.end
            ? { dateTime: newEvent.end }
            : undefined
      }

      // Find the associated calendar
      const associatedCalendar = googleCalendars.find(
         cal => cal.calendarId === updatedEvent.calendarId
      )

      dispatch(updateNewEvent({ updatedEvent, associatedCalendar }))
   }, [
      dispatch,
      newEvent,
      eventTitle,
      eventDescription,
      startTime,
      endTime,
      selectedCalendar.calendarId,
      selectedCalendar.accountEmail,
      selectedColorId,
      googleCalendars,
      isEventValid
   ])
   const handleTitleChange = useCallback((newTitle) => {
      setEventTitle(newTitle)
   }, [])

   const handleDescriptionChange = useCallback((newDescription) => {
      setEventDescription(newDescription)
   }, [])

   const handleStartTimeChange = useCallback((newStartTime) => {
      setStartTime(newStartTime)
   }, [])

   const handleEndTimeChange = useCallback((newEndTime) => {
      setEndTime(newEndTime)
   }, [])

   const handleSave = useCallback(async () => {
      if (!isEventValid) return

      const newStartTime = new Date(startTime)
      const newEndTime = new Date(endTime)
      newStartTime.setSeconds(0, 0)
      newEndTime.setSeconds(0, 0)
      const formattedNewEvent = {
         summary: eventTitle || t('placeholder-untitled'),
         description: eventDescription,
         calendarId: selectedCalendar.calendarId,
         accountEmail: selectedCalendar.accountEmail,
         colorId: selectedColorId,
         start: newStartTime.toISOString(),
         end: newEndTime.toISOString()
      }
      await createGoogleEvent(formattedNewEvent)
      handleOnClose()
   }, [
      isEventValid,
      createGoogleEvent,
      handleOnClose,
      eventTitle,
      eventDescription,
      selectedCalendar.calendarId,
      selectedCalendar.accountEmail,
      selectedColorId,
      startTime,
      endTime,
      t
   ])

   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------

   // Initialize form fields when event changes
   useEffect(() => {
      if (!newEvent) return
      setEventTitle(newEvent?.title || '')
      setEventDescription(newEvent?.description || '')
      setStartTime(newEvent?.start ? stringToDateTimeLocal(newEvent.start) : '')
      setEndTime(newEvent?.end ? stringToDateTimeLocal(newEvent.end) : '')

      // Initialize calendar selection
      const calendar = googleCalendars.find(
         (cal) => cal.calendarId === newEvent?.calendarId
      ) || {
         calendarId: newEvent?.calendarId || '',
         title: '',
         accountEmail: newEvent?.accountEmail || '',
         accessRole: '',
         color: ''
      }
      setSelectedCalendar(calendar)

      // Initialize color selection
      const foundColor = Object.entries(GOOGLE_CALENDAR_COLORS).find(
         ([, hex]) => hex === newEvent?.color
      )
      setSelectedColorId(foundColor ? foundColor[0] : null)
   }, [newEvent, googleCalendars])

   // Auto-save title changes with debounce
   useEffect(() => {
      if (hasEventTitleChanged) {
         const timeoutId = setTimeout(() => handleUpdateCalendarEvent(), 500)
         return () => clearTimeout(timeoutId)
      }
   }, [hasEventTitleChanged, handleUpdateCalendarEvent])

   // Auto-save description changes with debounce
   useEffect(() => {
      if (hasEventDescriptionChanged) {
         const timeoutId = setTimeout(() => handleUpdateCalendarEvent(), 500)
         return () => clearTimeout(timeoutId)
      }
   }, [hasEventDescriptionChanged, handleUpdateCalendarEvent])

   // Auto-save time changes with short debounce
   useEffect(() => {
      if (hasEventTimeChanged) {
         const timeoutId = setTimeout(() => handleUpdateCalendarEvent(), 100)
         return () => clearTimeout(timeoutId)
      }
   }, [hasEventTimeChanged, handleUpdateCalendarEvent])

   // Auto-save calendar changes immediately
   useEffect(() => {
      if (hasEventCalendarChanged) {
         const timeoutId = setTimeout(() => handleUpdateCalendarEvent(), 100)
         return () => clearTimeout(timeoutId)
      }
   }, [hasEventCalendarChanged, handleUpdateCalendarEvent])

   // Auto-save color changes immediately
   useEffect(() => {
      if (hasEventColorChanged) {
         const timeoutId = setTimeout(() => handleUpdateCalendarEvent(), 100)
         return () => clearTimeout(timeoutId)
      }
   }, [hasEventColorChanged, handleUpdateCalendarEvent])

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------
   if (!isInputingNewEvent || isCreatingGoogleEvent) {
      return null
   }
   return (
      <Popover
         isOpen
         onClose={handleOnClose}
         {...POPOVER_STYLES}
         placement='left-start'
      >
         <PopoverTrigger>
            <Box
               position='fixed'
               left={`${newEvent.createdMousePosition.x}px`}
               top={`${newEvent.createdMousePosition.y}px`}
               width='1px'
               height='1px'
               pointerEvents='none'
               zIndex={9999}
            />
         </PopoverTrigger>
         <PopoverContent
            {...POPOVER_CONTENT_STYLES}
            w='550px'
            maxH='none'
            overflow='visible'
            sx={{
               animation: 'fadeUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
               '@keyframes fadeUp': {
                  '0%': {
                     opacity: 0,
                     transform: 'translateY(12px)'
                  },
                  '100%': {
                     opacity: 1,
                     transform: 'translateY(0px)'
                  }
               }
            }}
         >
            <PopoverHeader {...POPOVER_HEADER_STYLES}>
               <HStack w='full' justifyContent='flex-end'>
                  <IconButton
                     icon={<PiX size={14} />}
                     size='sm'
                     variant='ghost'
                     onClick={handleOnClose}
                  />
               </HStack>
            </PopoverHeader>
            <PopoverBody {...POPOVER_BODY_STYLES}>
               <VStack align='start' spacing={3} w='full'>
                  <Box pr={1} pl={7} w='full'>
                     <EventTitleInput
                        title={eventTitle}
                        setTitle={handleTitleChange}
                     />
                  </Box>

                  <EventTimeInput
                     startTime={startTime}
                     setStartTime={handleStartTimeChange}
                     endTime={endTime}
                     setEndTime={handleEndTimeChange}
                  />

                  <EventCalendarSelect
                     selectedCalendar={selectedCalendar}
                     setSelectedCalendar={setSelectedCalendar}
                     selectedColorId={selectedColorId}
                     setSelectedColorId={setSelectedColorId}
                     calendars={googleCalendars || []}
                     accounts={googleAccounts || []}
                  />

                  <EventDescriptionInput
                     description={eventDescription}
                     setDescription={handleDescriptionChange}
                  />

                  <HStack w='full' justifyContent='flex-end' pt={2}>
                     <Button
                        size='md'
                        colorScheme='blue'
                        onClick={handleSave}
                        disabled={!isEventValid || isCreatingGoogleEvent}
                        isLoading={isCreatingGoogleEvent}
                        loadingText={t('btn-saving')}
                     >
                        {t('btn-save')}
                     </Button>
                  </HStack>
               </VStack>
            </PopoverBody>
         </PopoverContent>
      </Popover>
   )
}

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
EventCreatePopover.displayName = 'EventCreatePopover'


export default EventCreatePopover
