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

// Actions
import {
   loadCalendarAction,
   changeCalendarRangeAction,
   updateGoogleEventTimeAction
} from '../../actions/googleAccountActions'
import { updateTaskScheduleAction } from '../../actions/taskActions'

// Utils
import { getRangeStart, getRangeEnd } from '../../utils/dates'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '@pura/shared'
import {
   createLocalizedLocalizer,
   LOCALE_CONFIGS
} from '../../utils/eventUtils'

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================
// Style constants
const EVENT_TEXT_COLOR = '#1A202C'
const SELECTED_EVENT_SHADOW =
   '0px 6px 10px 0px rgba(0,0,0,.14),0px 1px 18px 0px rgba(0,0,0,.12),0px 3px 5px -1px rgba(0,0,0,.2)'
const POPOVER_STYLES = {
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
      updateTaskScheduleAction,
      googleAccount: { googleEvents, loading, range },
      currentLanguage,
      pageId,
      currentTaskId,
      googleCalendars
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

      // Customize event appearance based on selection state
      const eventPropGetter = useCallback((event, start, end, isSelected) => {
         const eventOpacity = 1
         const backgroundColor = event.color
         const boxShadow = isSelected ? SELECTED_EVENT_SHADOW : 'none'

         // Add conflict styling for conflicted events
         const isConflicted =
            event.syncStatus === SCHEDULE_SYNCE_STATUS.CONFLICTED
         const className = isConflicted ? 'conflicted-event' : ''

         return {
            className: className,
            style: {
               opacity: eventOpacity,
               backgroundColor: backgroundColor,
               color: EVENT_TEXT_COLOR,
               boxShadow: boxShadow,
               outline: 'none'
            }
         }
      }, [])

      // Handle event drag start
      const onDragStart = useCallback(({ event }) => {
         // Capture current mouse position immediately
         const captureMousePosition = () => {
            const handleMouseCapture = (mouseEvent) => {
               setMousePosition({
                  x: mouseEvent.clientX,
                  y: mouseEvent.clientY
               })
               document.removeEventListener('click', handleMouseCapture)

               // Show EventPreview after capturing position
               setPreviewEvent(event)
            }

            document.addEventListener('click', handleMouseCapture)
         }

         captureMousePosition()
      }, [])

      // Handle event drag and drop
      const onEventDrop = useCallback(
         async ({ event, start, end }) => {
            try {
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
                        task_detail_flg: true,
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
                        task_detail_flg: true,
                        target_event_index: event.pura_schedule_index
                     })
                  }

                  await updateGoogleEventTimeAction(updateData)
               }
            } catch (error) {
               console.error('Failed to update event:', error)
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
            try {
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
                        task_detail_flg: true,
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
                        task_detail_flg: true,
                        target_event_index: event.pura_schedule_index
                     })
                  }

                  await updateGoogleEventTimeAction(updateData)
               }
            } catch (error) {
               console.error('Failed to resize event:', error)
            }
         },
         [
            updateGoogleEventTimeAction,
            updateTaskScheduleAction,
            pageId,
            currentTaskId
         ]
      )

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
                     localizer={localizer}
                     showMultiDayTimes
                     step={30}
                     views={calendarConfig.views}
                     scrollToTime={calendarConfig.scrollToTime}
                     onRangeChange={onRangeChange}
                     eventPropGetter={eventPropGetter}
                     popup
                     culture={activeLanguage}
                     onDragStart={onDragStart}
                     onEventDrop={onEventDrop}
                     onEventResize={onEventResize}
                     resizable
                  />
               </VStack>

               {/* Event Preview Popover with Stable Transition */}
               {!!previewEvent && (
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
   updateTaskScheduleAction: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired,
   currentLanguage: PropTypes.string.isRequired,
   pageId: PropTypes.string,
   currentTaskId: PropTypes.string,
   googleCalendars: PropTypes.arrayOf(
      PropTypes.shape({
         calendarId: PropTypes.string,
         title: PropTypes.string,
         accountEmail: PropTypes.string,
         accessRole: PropTypes.string,
         color: PropTypes.string
      })
   ).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectCalendarData = createSelector(
   [
      (state) => state.googleAccount,
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

const selectGoogleCalendars = createSelector(
   (state) => state.googleAccount.googleCalendars,
   (googleCalendars) => {
      // Filter out calendars that are not writable
      return googleCalendars.filter(
         (cal) => cal.accessRole === 'owner' || cal.accessRole === 'writer'
      )
   }
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   ...selectCalendarData(state),
   googleCalendars: selectGoogleCalendars(state)
})

const mapDispatchToProps = {
   loadCalendarAction,
   changeCalendarRangeAction,
   updateGoogleEventTimeAction,
   updateTaskScheduleAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Calendar)
