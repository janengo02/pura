// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useEffect, useMemo } from 'react'
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
import { Skeleton, VStack } from '@chakra-ui/react'

// Internal Components
import Toolbar from './calendar/toolbar/Toolbar'
import CalendarNavigationToolbar from './calendar/toolbar/CalendarNavigationToolbar'
import EventWrapper from './calendar/event/EventWrapper'

// Actions
import {
   loadCalendarAction,
   changeCalendarRangeAction,
   updateGoogleEventAction
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
import { GOOGLE_CALENDAR_COLORS } from '../../components/data/defaultColor'

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================
// Style constants
const EVENT_TEXT_COLOR = '#1A202C'
const SELECTED_EVENT_SHADOW =
   '0px 6px 10px 0px rgba(0,0,0,.14),0px 1px 18px 0px rgba(0,0,0,.12),0px 3px 5px -1px rgba(0,0,0,.2)'

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
      updateGoogleEventAction,
      updateTaskScheduleAction,
      googleAccount: { googleEvents, loading, range },
      tasks,
      currentLanguage,
      pageId,
      currentTask,
      googleCalendars
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------
      const { currentLanguage: reactiveLanguage, t } = useReactiveTranslation()

      // Use reactive language to ensure updates when language changes
      const activeLanguage = reactiveLanguage || currentLanguage || 'en'

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
               eventWrapper: EventWrapper,
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
               newRangeEnd = getRangeEnd(newRange[1], localizer)
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
                     currentTask && currentTask._id === event.pura_task_id

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
                     currentTask &&
                     currentTask._id === event.pura_task_id

                  const foundColor = Object.entries(
                     GOOGLE_CALENDAR_COLORS
                  ).find(([, hex]) => hex === event.color)
                  const selectedCalendar = googleCalendars.find(
                     (cal) => cal.calendarId === event.calendarId
                  ) || {
                     calendarId: event.calendarId || '',
                     title: '',
                     accountEmail: event.accountEmail || '',
                     accessRole: '',
                     color: ''
                  }
                  // Update Google Calendar event
                  const updateData = {
                     eventId: event.id,
                     calendarId: event.calendarId,
                     originalCalendarId: event.calendarId,
                     accountEmail: event.accountEmail,
                     start: newStartTime.toISOString(),
                     end: newEndTime.toISOString(),
                     // Preserve other event properties
                     summary: event.title,
                     description: event.description,
                     colorId: foundColor ? foundColor[0] : null,
                     conferenceData: event.conferenceData,
                     calendarSummary: selectedCalendar.title,
                     calendarBackgroundColor: selectedCalendar.color,
                     // Add task detail parameters for synced events
                     ...(isSyncedCurrentTask && {
                        task_detail_flg: true,
                        task_id: event.pura_task_id,
                        slot_index: event.pura_schedule_index,
                        target_event_index: event.pura_schedule_index
                     })
                  }

                  await updateGoogleEventAction(updateData)
               }
            } catch (error) {
               console.error('Failed to update event:', error)
            }
         },
         [
            updateGoogleEventAction,
            updateTaskScheduleAction,
            pageId,
            currentTask,
            googleCalendars
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
                     currentTask && currentTask._id === event.pura_task_id

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
                     currentTask &&
                     currentTask._id === event.pura_task_id
                  const foundColor = Object.entries(
                     GOOGLE_CALENDAR_COLORS
                  ).find(([, hex]) => hex === event.color)
                  const selectedCalendar = googleCalendars.find(
                     (cal) => cal.calendarId === event.calendarId
                  ) || {
                     calendarId: event.calendarId || '',
                     title: '',
                     accountEmail: event.accountEmail || '',
                     accessRole: '',
                     color: ''
                  }
                  // Update Google Calendar event
                  const updateData = {
                     eventId: event.id,
                     calendarId: event.calendarId,
                     originalCalendarId: event.calendarId,
                     accountEmail: event.accountEmail,
                     start: newStartTime.toISOString(),
                     end: newEndTime.toISOString(),
                     // Preserve other event properties
                     summary: event.title,
                     description: event.description,
                     colorId: foundColor ? foundColor[0] : null,
                     conferenceData: event.conferenceData,
                     calendarSummary: selectedCalendar.title,
                     calendarBackgroundColor: selectedCalendar.color,
                     // Add task detail parameters for synced events
                     ...(isSyncedCurrentTask && {
                        task_detail_flg: true,
                        task_id: event.pura_task_id,
                        slot_index: event.pura_schedule_index,
                        target_event_index: event.pura_schedule_index
                     })
                  }

                  await updateGoogleEventAction(updateData)
               }
            } catch (error) {
               console.error('Failed to resize event:', error)
            }
         },
         [
            updateGoogleEventAction,
            updateTaskScheduleAction,
            pageId,
            currentTask
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
         if (range && range.length) {
            loadCalendarAction(range, tasks)
         }
      }, [range, loadCalendarAction, tasks])

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
            <VStack
               h='calc(100vh - 9rem)'
               alignItems='center'
               gap={2}
               paddingBottom={10}
            >
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
                  onEventDrop={onEventDrop}
                  onEventResize={onEventResize}
                  resizable
               />
            </VStack>
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
   updateGoogleEventAction: PropTypes.func.isRequired,
   updateTaskScheduleAction: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired,
   tasks: PropTypes.array.isRequired,
   currentLanguage: PropTypes.string.isRequired,
   pageId: PropTypes.string.isRequired,
   currentTask: PropTypes.object,
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
      (state) => state.page.tasks,
      (state) => state.language?.current || 'en',
      (state) => state.page._id,
      (state) => state.task.task
   ],
   (googleAccount, tasks, currentLanguage, pageId, currentTask) => ({
      googleAccount,
      tasks,
      currentLanguage,
      pageId,
      currentTask
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
   updateGoogleEventAction,
   updateTaskScheduleAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Calendar)
