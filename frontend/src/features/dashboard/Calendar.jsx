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
import 'react-big-calendar/lib/css/react-big-calendar.css'

// UI Components
import { Skeleton, useColorModeValue, VStack } from '@chakra-ui/react'

// Internal Components
import Toolbar from './calendar/toolbar/Toolbar'
import CalendarNavigationToolbar from './calendar/toolbar/CalendarNavigationToolbar'
import EventWrapper from './calendar/event/EventWrapper'

// Actions
import {
   loadCalendarAction,
   changeCalendarRangeAction
} from '../../actions/googleAccountActions'

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
      googleAccount: { googleEvents, loading, range },
      tasks,
      currentLanguage
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
               <BigCalendar
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
                  on
                  eventPropGetter={eventPropGetter}
                  popup
                  culture={activeLanguage}
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
   googleAccount: PropTypes.object.isRequired,
   tasks: PropTypes.array.isRequired,
   currentLanguage: PropTypes.string.isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectCalendarData = createSelector(
   [
      (state) => state.googleAccount,
      (state) => state.page.tasks,
      (state) => state.language?.current || 'en'
   ],
   (googleAccount, tasks, currentLanguage) => ({
      googleAccount,
      tasks,
      currentLanguage
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => selectCalendarData(state)

const mapDispatchToProps = {
   loadCalendarAction,
   changeCalendarRangeAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Calendar)
