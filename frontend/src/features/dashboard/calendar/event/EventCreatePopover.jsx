// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import PropTypes from 'prop-types'

// UI Components
import {
   PopoverContent,
   PopoverArrow,
   PopoverCloseButton,
   VStack,
   FormControl,
   FormLabel,
   Input,
   Textarea,
   Button,
   HStack,
   Text,
   Popover,
   PopoverTrigger,
   Box,
   PopoverHeader,
   PopoverBody,
   IconButton
} from '@chakra-ui/react'

// Utils
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import {
   clearCalendarEventAction,
   createGoogleEventAction,
   updateNewEventAction
} from '../../../../actions/calendarActions'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'
import { POPOVER_STYLES } from '../../Calendar'
import {
   POPOVER_BODY_STYLES,
   POPOVER_CONTENT_STYLES,
   POPOVER_HEADER_STYLES
} from './EventPreview'
import { EventTimeInput } from './EventTime'
import { EventDescriptionInput } from './EventDescription'
import { EventTitleInput } from './EventTitle'
import { EventCalendarSelect } from './EventCalendarInfo'
import { stringToDateTimeLocal } from '../../../../utils/dates'
import { PiX } from 'react-icons/pi'

// =============================================================================
// COMPONENT
// =============================================================================

const EventCreatePopover = ({
   newEvent,
   googleCalendars,
   googleAccounts,
   clearCalendarEventAction,
   createGoogleEventAction,
   updateNewEventAction
}) => {
   // -------------------------------------------------------------------------
   // HOOKS
   // -------------------------------------------------------------------------
   const { t } = useReactiveTranslation()

   // -------------------------------------------------------------------------
   // REFS & STATE
   // -------------------------------------------------------------------------
   const [eventTitle, setEventTitle] = useState('')

   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------
   // Memoized modal state based on task existence
   const isCreatingNewEvent = useMemo(() => Boolean(newEvent), [newEvent])
   const hasEventTitleChanged = useMemo(
      () => eventTitle && eventTitle !== newEvent?.title,
      [eventTitle, newEvent?.title]
   )
   // -------------------------------------------------------------------------
   // HANDLERS
   // -------------------------------------------------------------------------
   const handleUpdateCalendarEvent = useCallback(() => {
      const updatedEvent = {
         ...newEvent,
         summary: eventTitle,
         start: newEvent?.start ? { dateTime: newEvent.start } : undefined,
         end: newEvent?.end ? { dateTime: newEvent.end } : undefined
      }
      updateNewEventAction(updatedEvent)
   }, [updateNewEventAction, newEvent, eventTitle])
   const handleTitleChange = useCallback((newTitle) => {
      setEventTitle(newTitle)
   }, [])

   const handleSave = useCallback(() => {
      createGoogleEventAction(newEvent)
      clearCalendarEventAction()
   }, [createGoogleEventAction, newEvent, clearCalendarEventAction])

   const handleOnClose = useCallback(() => {
      clearCalendarEventAction()
   }, [clearCalendarEventAction])

   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------

   // Initialize task data when task changes
   useEffect(() => {
      if (newEvent) {
         setEventTitle(newEvent.title || '')
      }
   }, [newEvent])

   // Auto-save title changes with debounce
   useEffect(() => {
      if (hasEventTitleChanged) {
         const timeoutId = setTimeout(() => handleUpdateCalendarEvent(), 500)
         return () => clearTimeout(timeoutId)
      }
   }, [hasEventTitleChanged, handleUpdateCalendarEvent])

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------
   if (!isCreatingNewEvent) {
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

                  <HStack w='full' justifyContent='flex-end' pt={2}>
                     <Button size='md' colorScheme='blue' onClick={handleSave}>
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

EventCreatePopover.propTypes = {
   newEvent: PropTypes.object,
   googleAccounts: PropTypes.array.isRequired,
   googleCalendars: PropTypes.array.isRequired,
   clearCalendarEventAction: PropTypes.func.isRequired,
   createGoogleEventAction: PropTypes.func.isRequired,
   updateNewEventAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectCalendarData = createSelector(
   [(state) => state.calendar],
   (calendar) => ({
      newEvent: calendar.googleEvents.find((event) => event.id === 'new'),
      googleAccounts: calendar.googleAccounts,
      googleCalendars: calendar.googleCalendars.filter(
         (cal) => cal.accessRole === 'owner' || cal.accessRole === 'writer'
      )
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   ...selectCalendarData(state)
})

const mapDispatchToProps = {
   clearCalendarEventAction,
   createGoogleEventAction,
   updateNewEventAction
}

export default connect(mapStateToProps, mapDispatchToProps)(EventCreatePopover)
