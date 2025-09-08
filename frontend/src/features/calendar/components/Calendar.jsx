// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'

// Redux
import { useSelector, useDispatch } from 'react-redux'
import { createSelector } from 'reselect'

// External Libraries
import moment from 'moment'
import 'moment/locale/ja' // Import Japanese locale data
import { Calendar as BigCalendar, Views } from 'react-big-calendar'
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

// UI Components
import {
   Skeleton,
   VStack,
   Box,
   Popover,
   PopoverTrigger
} from '@chakra-ui/react'

// Internal Components
import Toolbar from './toolbar/Toolbar'
import CalendarNavigationToolbar from './toolbar/CalendarNavigationToolbar'
import EventPreview from '../../event/components/EventPreview'
import EventCreatePopover from '../../event/components/EventCreatePopover'

// Actions
import { useLazyLoadCalendarQuery, useUpdateGoogleEventTimeMutation } from '../api/calendarApi'
import { updateCalendarRange, createCalendarEvent } from '../calendarSlice'
import { useUpdateTaskScheduleMutation } from '../../task/api/taskApi'
import {
   setAlert,
   removeAllAlerts
} from '../../ui/alertSlice'

// Utils
import { getRangeStart, getRangeEnd } from '../../../shared/utils/dates'
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '../../../shared/constants/syncStatus'
import {
   createLocalizedLocalizer,
   LOCALE_CONFIGS
} from '../../../shared/utils/eventUtils'

// =============================================================================
// SELECTORS
// =============================================================================

const selectCalendarData = createSelector(
   [(state) => state.calendarSlice],
   (calendarSlice) => ({
      googleEvents: calendarSlice.googleEvents,
      googleCalendars: calendarSlice.googleCalendars,
      googleAccounts: calendarSlice.googleAccounts,
      defaultAccount: calendarSlice.defaultAccount,
      range: calendarSlice.range,
      navigationTarget: calendarSlice.navigationTarget
   })
)

const selectCurrentLanguage = createSelector(
   [(state) => state.language?.current || 'en'],
   (currentLanguage) => currentLanguage
)

const selectPageId = createSelector(
   [(state) => state.pageSlice.id],
   (pageId) => pageId
)

const selectCurrentTaskId = createSelector(
   [(state) => state.taskSlice.task?.id],
   (currentTaskId) => currentTaskId
)

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================
// Style constants
const SELECTED_EVENT_SHADOW =
   '0px 6px 10px 0px rgba(0,0,0,.14),0px 1px 18px 0px rgba(0,0,0,.12),0px 3px 5px -1px rgba(0,0,0,.2)'
export const POPOVER_STYLES = {
   placement: 'auto',
   isLazy: true,
   strategy: 'fixed',
   modifiers: [
      {
         name: 'preventOverflow',
         options: {
            boundary: 'viewport',
            padding: 8
         }
      },
      {
         name: 'flip',
         options: {
            fallbackPlacements: ['top', 'bottom', 'right', 'left']
         }
      },
      {
         name: 'zIndex',
         options: {
            zIndex: 10000
         }
      }
   ]
}

// Create DnD-enabled calendar
const DnDCalendar = withDragAndDrop(BigCalendar)

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================
const ColoredDateCellWrapper = ({ children }) => {
   return React.cloneElement(React.Children.only(children), {
      style: {
         backgroundColor: 'bg.overlay'
      }
   })
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Calendar = React.memo(() => {
      // -------------------------------------------------------------------------
      // REDUX HOOKS
      // -------------------------------------------------------------------------
      const dispatch = useDispatch()
      const {
         googleEvents,
         googleCalendars,
         googleAccounts,
         defaultAccount,
         range,
         navigationTarget
      } = useSelector(selectCalendarData)
      const currentLanguage = useSelector(selectCurrentLanguage)
      const pageId = useSelector(selectPageId)
      const currentTaskId = useSelector(selectCurrentTaskId)

      // -------------------------------------------------------------------------
      // RTK QUERY HOOKS
      // -------------------------------------------------------------------------
      const [loadCalendar, { isLoading }] = useLazyLoadCalendarQuery()
      const [updateTaskSchedule] = useUpdateTaskScheduleMutation()
      const [updateGoogleEventTime] = useUpdateGoogleEventTimeMutation()
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------
      const { currentLanguage: reactiveLanguage, t } = useReactiveTranslation()

      // Use reactive language to ensure updates when language changes
      const activeLanguage = reactiveLanguage || currentLanguage || 'en'

      // -------------------------------------------------------------------------
      // STATE
      // -------------------------------------------------------------------------

      const [previewEvent, setPreviewEvent] = useState(null)
      const [mousePosition, setMousePosition] = useState({ x: 20, y: 20 })
      const [currentDate, setCurrentDate] = useState(new Date())
      const [highlightedEvent, setHighlightedEvent] = useState(null)

      // Ref to track current alert timeout
      const alertTimeoutRef = useRef(null)

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      // Create language-aware localizer that updates when language changes
      const localizer = useMemo(
         () => createLocalizedLocalizer(activeLanguage),
         [activeLanguage]
      )

      const calendarConfig = useMemo(
         () => ({
            components: {
               timeSlotWrapper: ColoredDateCellWrapper,
               toolbar: CalendarNavigationToolbar
            },
            defaultDate: new Date(),
            views: [Views.MONTH, Views.WEEK, Views.WORK_WEEK, Views.DAY], // Excluded agenda view
            scrollToTime: new Date()
         }),
         []
      )

      // Filter visible events based on calendar visibility and set placeholder for empty titles
      const visibleEvents = useMemo(
         () =>
            googleEvents
               .filter((ev) => ev.calendarVisible)
               .map((ev) => ({
                  ...ev,
                  title: ev.title || t('placeholder-untitled')
               })),
         [googleEvents, t]
      )

      // -------------------------------------------------------------------------
      // UTILITY FUNCTIONS
      // -------------------------------------------------------------------------

      // Show info alert that auto-dismisses after 3 seconds
      const showConnectGoogleAccountAlert = useCallback(({alertTitle, alertMessage}) => {
         // Clear any existing timeout to reset the 3-second timer
         if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current)
         }

         // Set the alert (this will replace any existing alert)
         dispatch(setAlert(
            alertTitle,
            alertMessage,
            'info'
         ))

         // Set new timeout to remove all alerts after 3 seconds
         alertTimeoutRef.current = setTimeout(() => {
            dispatch(removeAllAlerts())
            alertTimeoutRef.current = null
         }, 5000)
      }, [dispatch])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      // Handle calendar range changes (month/week navigation)
      const onRangeChange = useCallback(
         (newRange) => {
            if (!newRange || !range || !range.length) return
            let newRangeStart
            let newRangeEnd
            // Handle month view range change
            if (!Array.isArray(newRange)) {
               newRangeStart = getRangeStart(newRange.start, localizer)
               newRangeEnd = getRangeEnd(newRange.end, localizer)
            } else {
               newRangeStart = getRangeStart(newRange[0], localizer)
               newRangeEnd = getRangeEnd(newRange[1] || newRange[0], localizer)
            }

            dispatch(updateCalendarRange({ range: [newRangeStart, newRangeEnd] }))
         },
         [dispatch, localizer, range]
      )

      // Utility function to determine if a color is dark or light
      const isColorDark = useCallback((color) => {
         if (!color) return false

         // Handle CSS variables
         if (color.startsWith('var(')) return false // Let CSS handle it

         // Remove # if present
         const hex = color.replace('#', '')

         // Convert hex to RGB
         const r = parseInt(hex.substr(0, 2), 16)
         const g = parseInt(hex.substr(2, 2), 16)
         const b = parseInt(hex.substr(4, 2), 16)

         // Calculate luminance using relative luminance formula
         const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

         // Return true if color is dark (luminance < 0.5)
         return luminance < 0.7
      }, [])

      // Customize event appearance based on selection state
      const eventPropGetter = useCallback(
         (event, start, end, isSelected) => {
            const eventOpacity = 1
            const backgroundColor = event.color
            let boxShadow = isSelected ? SELECTED_EVENT_SHADOW : 'none'
            let transition = 'none'
            let filter = 'none'

            // Add conflict styling for conflicted events
            const isConflicted =
               event.syncStatus === SCHEDULE_SYNCE_STATUS.CONFLICTED
            let className = isConflicted ? 'conflicted-event' : ''

            // Add highlight styling for navigated events
            const isHighlighted =
               highlightedEvent &&
               event.puraTaskId === highlightedEvent.taskId &&
               event.puraScheduleIndex === highlightedEvent.slotIndex

            if (isHighlighted) {
               filter = 'saturate(2) brightness(1.1)'
               transition = 'filter 0.5s ease-in-out'
               boxShadow =
                  '0 8px 16px rgba(0,0,0,0.3), 0 4px 6px rgba(0,0,0,0.2)'
               className += (className ? ' ' : '') + 'highlighted-event'
            }

            // Determine text color based on background brightness
            const isDarkBackground = isColorDark(backgroundColor)
            const textColor = isDarkBackground
               ? 'var(--chakra-colors-gray-100)'
               : 'var(--chakra-colors-gray-700)'

            return {
               className: className,
               style: {
                  opacity: eventOpacity,
                  backgroundColor: backgroundColor,
                  color: textColor,
                  boxShadow: boxShadow,
                  outline: 'none',
                  filter: filter,
                  transition: transition
               }
            }
         },
         [highlightedEvent, isColorDark]
      )

      // Handle event selection
      const onSelectEvent = useCallback((event, e) => {
         if (event.id === 'new') return // Ignore new event placeholder
         // Capture mouse position directly from the event
         setMousePosition({
            x: e.clientX,
            y: e.clientY
         })

         // Show EventPreview
         setPreviewEvent(event)
      }, [])

      // Handle slot selection for creating new events
      const onSelectSlot = useCallback(
         (slotInfo) => {
            if (slotInfo.action !== 'select' || !slotInfo.bounds) return

            // Check if we have Google accounts and calendars
            if (!googleAccounts || googleAccounts.length === 0) {
               showConnectGoogleAccountAlert({
                  alertTitle: 'alert-calendar-connect-required',
                  alertMessage: 'alert-calendar-connect-google-account-message'
               })
               return
            }

            if (!googleCalendars || googleCalendars.length === 0) {
               showConnectGoogleAccountAlert({
                  alertTitle: 'alert-calendar-connect-required',
                  alertMessage: 'alert-calendar-connect-google-account-message'
               })
               return
            }

            // Check if we have a default account set
            if (!defaultAccount || !defaultAccount.accountEmail) {
               showConnectGoogleAccountAlert({
                  alertTitle: 'alert-default-account-required',
                  alertMessage: 'alert-default-account-required-message'
               })
               return
            }

            // Check if there are any writable calendars
            const accountEmails = googleAccounts.map(
               (account) => account.email || account.accountEmail
            )
            const availableCalendars = googleCalendars.filter((cal) =>
               accountEmails.includes(cal.accountEmail)
            )
            const writableCalendars = availableCalendars.filter(
               (cal) =>
                  cal.accessRole === 'owner' || cal.accessRole === 'writer'
            )

            if (writableCalendars.length === 0) {
               showConnectGoogleAccountAlert({
                  alertTitle: 'alert-writable-calendar-required',
                  alertMessage: 'alert-cwritable-calendar-required-message'
               })
               return
            }

            // Capture mouse position for popover placement
            const mousePosition = {
               x: slotInfo.bounds.left || 0,
               y: slotInfo.bounds.bottom || 0
            }
            const newEvent = {
               id: 'new',
               summary: '',
               colorId: null,
               description: null,
               start: {
                  dateTime: slotInfo.start
               },
               end: {
                  dateTime: slotInfo.end
               }
            }

            // Dispatch action to create calendar event
            dispatch(createCalendarEvent({ newEvent, mousePosition }))
         },
         [
            dispatch,
            googleAccounts,
            googleCalendars,
            defaultAccount,
            showConnectGoogleAccountAlert,
         ]
      )

      // Handle event drag and drop
      const onEventDrop = useCallback(
         async ({ event, start, end }) => {
            if (event.id === 'new') return // Ignore new event placeholder
            // Set seconds and milliseconds to 0 for consistency
            const newStartTime = new Date(start)
            const newEndTime = new Date(end)
            newStartTime.setSeconds(0, 0)
            newEndTime.setSeconds(0, 0)

            if (event.eventType === 'task') {
               // Check if this is the current task being viewed
               const isCurrentTask =
                  currentTaskId && currentTaskId === event.puraTaskId

               // Update task schedule slot for task events
               await updateTaskSchedule({
                  pageId: pageId,
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
               // Check if this is a synced event with current task
               const isSyncedCurrentTask =
                  event.eventType === 'synced' &&
                  currentTaskId &&
                  currentTaskId === event.puraTaskId

               // Update Google Calendar event
               const updateData = {
                  eventId: event.id,
                  calendarId: event.calendarId,
                  originalCalendarId: event.calendarId,
                  accountEmail: event.accountEmail,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  taskId: event.puraTaskId,
                  slotIndex: event.puraScheduleIndex,
                  // Add task detail parameters for synced events
                  ...(isSyncedCurrentTask && {
                     targetEventIndex: event.puraScheduleIndex
                  })
               }

               await updateGoogleEventTime(updateData)
            }
         },
         [
            updateGoogleEventTime,
            pageId,
            currentTaskId,
            updateTaskSchedule
         ]
      )

      // Handle event resize
      const onEventResize = useCallback(
         async ({ event, start, end }) => {
            if (event.id === 'new') return // Ignore new event placeholder
            // Set seconds and milliseconds to 0 for consistency
            const newStartTime = new Date(start)
            const newEndTime = new Date(end)
            newStartTime.setSeconds(0, 0)
            newEndTime.setSeconds(0, 0)

            if (event.eventType === 'task') {
               // Check if this is the current task being viewed
               const isCurrentTask =
                  currentTaskId && currentTaskId === event.puraTaskId

               // Update task schedule slot for task events
               await updateTaskSchedule({
                  pageId: pageId,
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
               // Check if this is a synced event with current task
               const isSyncedCurrentTask =
                  event.eventType === 'synced' &&
                  currentTaskId &&
                  currentTaskId === event.puraTaskId
               // Update Google Calendar event
               const updateData = {
                  eventId: event.id,
                  calendarId: event.calendarId,
                  originalCalendarId: event.calendarId,
                  accountEmail: event.accountEmail,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  taskId: event.puraTaskId,
                  slotIndex: event.puraScheduleIndex,
                  // Add task detail parameters for synced events
                  ...(isSyncedCurrentTask && {
                     targetEventIndex: event.puraScheduleIndex
                  })
               }

               await updateGoogleEventTime(updateData)
            }
         },
         [
            updateGoogleEventTime,
            pageId,
            currentTaskId,
            updateTaskSchedule
         ]
      )

      // Handle navigation target changes (from sync button clicks)
      useEffect(() => {
         if (navigationTarget && navigationTarget.date) {
            const targetDate = new Date(navigationTarget.date)

            setCurrentDate(targetDate)

            // Set highlighted event for styling
            if (
               navigationTarget.taskId &&
               typeof navigationTarget.slotIndex === 'number'
            ) {
               setHighlightedEvent({
                  taskId: navigationTarget.taskId,
                  slotIndex: navigationTarget.slotIndex
               })

               // Clear highlight after 2 seconds
               const timer = setTimeout(() => {
                  setHighlightedEvent(null)
               }, 500)

               return () => clearTimeout(timer)
            }

            // Calculate new range based on target date and view
            const newRangeStart = getRangeStart(targetDate, localizer)
            const newRangeEnd = getRangeEnd(targetDate, localizer)
            dispatch(updateCalendarRange({ range: [newRangeStart, newRangeEnd] }))
         }
      }, [navigationTarget, localizer, dispatch])

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Update moment locale when language changes and force re-render
      useEffect(() => {
         const config = LOCALE_CONFIGS[activeLanguage] || LOCALE_CONFIGS.en

         // Configure moment globally
         moment.locale(activeLanguage, config)
         moment.locale(activeLanguage)

         // Force a small delay to ensure locale is fully applied
         const timer = setTimeout(() => {
            // Trigger any components that might need to re-render
            window.dispatchEvent(
               new CustomEvent('momentLocaleChanged', {
                  detail: { language: activeLanguage }
               })
            )
         }, 10)

         return () => clearTimeout(timer)
      }, [activeLanguage])

      useEffect(() => {
         if (range && range.length && pageId) {
            loadCalendar({
               minDate: range[0],
               maxDate: range[1],
               pageId
            })
         }
      }, [range, loadCalendar, pageId])

      // Initialize calendar with default date range on mount
      useEffect(() => {
         const initialRange = [
            getRangeStart(calendarConfig.defaultDate, localizer),
            getRangeEnd(calendarConfig.defaultDate, localizer)
         ]
         dispatch(updateCalendarRange({ range: initialRange }))
      }, [calendarConfig.defaultDate, dispatch, localizer])

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Skeleton isLoaded={!isLoading}>
            <Box position='relative' h='full'>
               <VStack h='full' alignItems='flex-start' gap={2} paddingBottom={10}>
                  <Toolbar />
                  <DnDCalendar
                     components={calendarConfig.components}
                     defaultDate={calendarConfig.defaultDate}
                     events={visibleEvents || []}
                     defaultView='week'
                     date={currentDate}
                     onNavigate={setCurrentDate}
                     localizer={localizer}
                     showMultiDayTimes
                     step={30}
                     views={calendarConfig.views}
                     scrollToTime={calendarConfig.scrollToTime}
                     onRangeChange={onRangeChange}
                     eventPropGetter={eventPropGetter}
                     popup
                     culture={activeLanguage}
                     onEventDrop={onEventDrop}
                     onEventResize={onEventResize}
                     selectable
                     timeslots={2}
                     onSelectEvent={onSelectEvent}
                     onSelectSlot={onSelectSlot}
                     resizable
                  />
               </VStack>

               {/* Event Preview Popover with Stable Transition */}
               {!!previewEvent &&
                  previewEvent.id &&
                  previewEvent.id !== 'new' && (
                     <Popover
                        isOpen
                        onClose={() => {
                           setPreviewEvent(null)
                        }}
                        {...POPOVER_STYLES}
                     >
                        <PopoverTrigger>
                           <Box
                              position='fixed'
                              left={`${mousePosition.x}px`}
                              top={`${mousePosition.y}px`}
                              width='1px'
                              height='1px'
                              pointerEvents='none'
                              zIndex={9999}
                           />
                        </PopoverTrigger>
                        <EventPreview
                           event={previewEvent}
                           onClose={() => {
                              setPreviewEvent(null)
                           }}
                        />
                     </Popover>
                  )}
               <EventCreatePopover />
            </Box>
         </Skeleton>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================


Calendar.displayName = 'Calendar'

// PropTypes validation - now empty since we use hooks
Calendar.propTypes = {}

// =============================================================================
// EXPORT
// =============================================================================

export default Calendar
