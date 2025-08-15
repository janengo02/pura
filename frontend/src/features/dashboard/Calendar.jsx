// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
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
import Toolbar from './calendar/toolbar/Toolbar'
import CalendarNavigationToolbar from './calendar/toolbar/CalendarNavigationToolbar'
import EventPreview from './calendar/event/EventPreview'
import EventCreatePopover from './calendar/event/EventCreatePopover'

// Actions
import {
   loadCalendarAction,
   changeCalendarRangeAction,
   updateGoogleEventTimeAction,
   createCalendarEventAction
} from '../../actions/calendarActions'
import { updateTaskScheduleAction } from '../../actions/taskActions'
import {
   setAlertAction,
   removeAllAlertAction
} from '../../actions/alertActions'

// Utils
import { getRangeStart, getRangeEnd } from '../../utils/dates'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '../../components/data/syncStatus'
import {
   createLocalizedLocalizer,
   LOCALE_CONFIGS
} from '../../utils/eventUtils'

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
/**
 * Wrapper component for date cells with custom styling
 */
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

const Calendar = React.memo(
   ({
      // Redux props
      loadCalendarAction,
      changeCalendarRangeAction,
      updateGoogleEventTimeAction,
      createCalendarEventAction,
      updateTaskScheduleAction,
      setAlertAction,
      removeAllAlertAction,
      googleAccount: {
         googleEvents,
         googleCalendars,
         googleAccounts,
         loading,
         range,
         navigationTarget
      },
      currentLanguage,
      pageId,
      currentTaskId
   }) => {
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

      // Calendar configuration with optimized performance
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
      const showConnectGoogleAccountAlert = useCallback(() => {
         // Clear any existing timeout to reset the 3-second timer
         if (alertTimeoutRef.current) {
            clearTimeout(alertTimeoutRef.current)
         }

         // Set the alert (this will replace any existing alert)
         setAlertAction(
            'calendar-connect-required',
            'calendar-connect-google-account-message',
            'info'
         )

         // Set new timeout to remove all alerts after 3 seconds
         alertTimeoutRef.current = setTimeout(() => {
            removeAllAlertAction()
            alertTimeoutRef.current = null
         }, 5000)
      }, [setAlertAction, removeAllAlertAction])

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

            changeCalendarRangeAction([newRangeStart, newRangeEnd])
         },
         [changeCalendarRangeAction, localizer, range]
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
            let backgroundColor = event.color
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
               event.pura_task_id === highlightedEvent.taskId &&
               event.pura_schedule_index === highlightedEvent.slotIndex

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
               showConnectGoogleAccountAlert()
               return
            }

            if (!googleCalendars || googleCalendars.length === 0) {
               showConnectGoogleAccountAlert()
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
               showConnectGoogleAccountAlert()
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
            createCalendarEventAction(newEvent, mousePosition)
         },
         [
            createCalendarEventAction,
            googleAccounts,
            googleCalendars,
            showConnectGoogleAccountAlert
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
                  currentTaskId && currentTaskId === event.pura_task_id

               // Update task schedule slot for task events
               await updateTaskScheduleAction({
                  page_id: pageId,
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  ...(isCurrentTask && {
                     target_event_index: event.pura_schedule_index
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
                  currentTaskId === event.pura_task_id

               // Update Google Calendar event
               const updateData = {
                  eventId: event.id,
                  calendarId: event.calendarId,
                  originalCalendarId: event.calendarId,
                  accountEmail: event.accountEmail,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  // Add task detail parameters for synced events
                  ...(isSyncedCurrentTask && {
                     target_event_index: event.pura_schedule_index
                  })
               }

               await updateGoogleEventTimeAction(updateData)
            }
         },
         [
            updateGoogleEventTimeAction,
            updateTaskScheduleAction,
            pageId,
            currentTaskId
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
                  currentTaskId && currentTaskId === event.pura_task_id

               // Update task schedule slot for task events
               await updateTaskScheduleAction({
                  page_id: pageId,
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  ...(isCurrentTask && {
                     target_event_index: event.pura_schedule_index
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
                  currentTaskId === event.pura_task_id
               // Update Google Calendar event
               const updateData = {
                  eventId: event.id,
                  calendarId: event.calendarId,
                  originalCalendarId: event.calendarId,
                  accountEmail: event.accountEmail,
                  start: newStartTime.toISOString(),
                  end: newEndTime.toISOString(),
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  // Add task detail parameters for synced events
                  ...(isSyncedCurrentTask && {
                     target_event_index: event.pura_schedule_index
                  })
               }

               await updateGoogleEventTimeAction(updateData)
            }
         },
         [
            updateGoogleEventTimeAction,
            updateTaskScheduleAction,
            pageId,
            currentTaskId
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
            changeCalendarRangeAction([newRangeStart, newRangeEnd])
         }
      }, [navigationTarget, localizer, changeCalendarRangeAction])

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
            loadCalendarAction(range, pageId)
         }
      }, [range, loadCalendarAction, pageId])

      // Initialize calendar with default date range on mount
      useEffect(() => {
         const initialRange = [
            getRangeStart(calendarConfig.defaultDate, localizer),
            getRangeEnd(calendarConfig.defaultDate, localizer)
         ]
         changeCalendarRangeAction(initialRange)
      }, [calendarConfig.defaultDate, changeCalendarRangeAction, localizer])

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Skeleton isLoaded={!loading}>
            <Box position='relative' h='calc(100vh - 9rem)'>
               <VStack h='full' alignItems='center' gap={2} paddingBottom={10}>
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

// Display name for debugging
Calendar.displayName = 'Calendar'

// PropTypes validation
Calendar.propTypes = {
   loadCalendarAction: PropTypes.func.isRequired,
   changeCalendarRangeAction: PropTypes.func.isRequired,
   updateGoogleEventTimeAction: PropTypes.func.isRequired,
   createCalendarEventAction: PropTypes.func.isRequired,
   updateTaskScheduleAction: PropTypes.func.isRequired,
   setAlertAction: PropTypes.func.isRequired,
   removeAllAlertAction: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired,
   currentLanguage: PropTypes.string.isRequired,
   pageId: PropTypes.string,
   currentTaskId: PropTypes.string
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectCalendarData = createSelector(
   [
      (state) => state.calendar,
      (state) => state.language?.current || 'en',
      (state) => state.page._id,
      (state) => state.task.task?._id
   ],
   (googleAccount, currentLanguage, pageId, currentTaskId) => ({
      googleAccount,
      currentLanguage,
      pageId,
      currentTaskId
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   ...selectCalendarData(state)
})

const mapDispatchToProps = {
   loadCalendarAction,
   changeCalendarRangeAction,
   updateGoogleEventTimeAction,
   createCalendarEventAction,
   updateTaskScheduleAction,
   setAlertAction,
   removeAllAlertAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Calendar)
