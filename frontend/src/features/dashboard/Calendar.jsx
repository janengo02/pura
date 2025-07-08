// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// External Libraries
import moment from 'moment'
import {
   Calendar as BigCalendar,
   Views,
   momentLocalizer
} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateLocalizer } from 'react-big-calendar'

// UI Components
import { Skeleton, useColorModeValue, VStack } from '@chakra-ui/react'

// Internal Components
import Toolbar from './calendar/toolbar/Toolbar'
import CalendarNavigationToolbar from './calendar/toolbar/CalendarNavigationToolbar'
import EventWrapper from './calendar/event/EventWrapper'

// Actions
import { loadCalendarAction } from '../../actions/googleAccountActions'

// Utils
import {
   firstVisibleDay,
   neq,
   lastVisibleDay,
   inRange
} from '../../utils/dates'

// =============================================================================
// CONSTANTS & CONFIGURATION
// =============================================================================

// Configure Japanese locale
moment.locale('ja', {
   week: {
      dow: 1 // Monday is the first day of the week
   }
})

const mLocalizer = momentLocalizer(moment)

// Style constants
const EVENT_TEXT_COLOR = '#1A202C'
const SELECTED_EVENT_SHADOW =
   '0px 6px 10px 0px rgba(0,0,0,.14),0px 1px 18px 0px rgba(0,0,0,.12),0px 3px 5px -1px rgba(0,0,0,.2)'

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

const ColoredDateCellWrapper = ({ children }) => {
   // Use Chakra's color mode hook for dynamic background
   const bgColor = useColorModeValue('white', 'gray.700')

   return React.cloneElement(React.Children.only(children), {
      style: {
         backgroundColor: bgColor
      }
   })
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Calendar = ({
   // Redux props
   loadCalendarAction,
   localizer = mLocalizer,
   googleAccount: { googleEvents, loading, range },
   tasks
}) => {
   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------

   const calendarConfig = useMemo(
      () => ({
         components: {
            timeSlotWrapper: ColoredDateCellWrapper,
            eventWrapper: EventWrapper,
            toolbar: CalendarNavigationToolbar
         },
         defaultDate: new Date(),
         views: Object.keys(Views).map((k) => Views[k]),
         scrollToTime: new Date()
      }),
      []
   )

   // Filter visible events based on calendar visibility
   const visibleEvents = useMemo(
      () => googleEvents.filter((ev) => ev.calendarVisible),
      [googleEvents]
   )

   // -------------------------------------------------------------------------
   // EVENT HANDLERS
   // -------------------------------------------------------------------------

   // Handle calendar range changes (month/week navigation)
   const onRangeChange = useCallback(
      (newRange) => {
         if (!newRange) return

         // Handle month view range change
         if (!Array.isArray(newRange)) {
            if (
               neq(newRange.start, range[0], 'day') ||
               neq(newRange.end, range[1], 'day')
            ) {
               loadCalendarAction([newRange.start, newRange.end], tasks)
            }
            return
         }

         // Handle week/day view range change
         if (!inRange(newRange[0], range[0], range[1], 'day')) {
            loadCalendarAction(
               [
                  firstVisibleDay(newRange[0], localizer),
                  lastVisibleDay(newRange[0], localizer)
               ],
               tasks
            )
         }
      },
      [loadCalendarAction, localizer, range, tasks]
   )

   // Customize event appearance based on selection state
   const eventPropGetter = useCallback((event, start, end, isSelected) => {
      const eventOpacity = 1
      const backgroundColor = event.color
      const boxShadow = isSelected ? SELECTED_EVENT_SHADOW : 'none'

      return {
         style: {
            opacity: eventOpacity,
            backgroundColor: backgroundColor,
            border: 'none',
            color: EVENT_TEXT_COLOR,
            boxShadow: boxShadow,
            outline: 'none'
         }
      }
   }, [])

   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------

   // Initialize calendar with default date range on mount
   useEffect(() => {
      const initialRange = [
         firstVisibleDay(calendarConfig.defaultDate, localizer),
         lastVisibleDay(calendarConfig.defaultDate, localizer)
      ]
      loadCalendarAction(initialRange, tasks)
   }, [calendarConfig.defaultDate, loadCalendarAction, localizer, tasks])

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
               eventPropGetter={eventPropGetter}
               popup
            />
         </VStack>
      </Skeleton>
   )
}

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// PropTypes validation
Calendar.propTypes = {
   loadCalendarAction: PropTypes.func.isRequired,
   localizer: PropTypes.instanceOf(DateLocalizer),
   googleAccount: PropTypes.object.isRequired,
   tasks: PropTypes.array.isRequired
}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   googleAccount: state.googleAccount,
   tasks: state.page.tasks
})

const mapDispatchToProps = {
   loadCalendarAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Calendar)
