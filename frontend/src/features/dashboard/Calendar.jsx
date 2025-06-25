import React, { useCallback, useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import moment from 'moment'
import {
   Calendar as BigCalendar,
   Views,
   momentLocalizer
} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { DateLocalizer } from 'react-big-calendar'
import { Skeleton, VStack } from '@chakra-ui/react'
import Toolbar from './calendar/toolbar/Toolbar'
import EventWrapper from './calendar/event/EventWrapper'
import { loadCalendarAction } from '../../actions/googleAccountActions'
import {
   firstVisibleDay,
   neq,
   lastVisibleDay,
   inRange
} from '../../utils/dates'

moment.locale('es-es', {
   week: {
      dow: 1 //Monday is the first day of the week.
   }
})
const mLocalizer = momentLocalizer(moment)

const ColoredDateCellWrapper = ({ children }) => {
   return React.cloneElement(React.Children.only(children), {
      style: {
         backgroundColor: 'white'
      }
   })
}
const Calendar = ({
   // Redux props
   loadCalendarAction,
   localizer = mLocalizer,
   googleAccount: { googleEvents, loading, range },
   tasks
}) => {
   const { components, defaultDate, views, scrollToTime } = useMemo(
      () => ({
         components: {
            timeSlotWrapper: ColoredDateCellWrapper,
            eventWrapper: EventWrapper
         },
         defaultDate: new Date(),
         views: Object.keys(Views).map((k) => Views[k]),
         scrollToTime: new Date()
      }),
      []
   )
   const visibleEvents = googleEvents.filter((ev) => ev.calendarVisible)
   const onRangeChange = useCallback(
      (newRange) => {
         if (!newRange) {
            return
         }
         if (!Array.isArray(newRange)) {
            // Change month
            if (
               neq(newRange.start, range[0], 'day') ||
               neq(newRange.end, range[1], 'day')
            )
               loadCalendarAction([newRange.start, newRange.end], tasks)
            return
         }
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
   const eventPropGetter = useCallback((event, start, end, isSelected) => {
      const eventOpacity = 1
      const backgroundColor = event.color
      const boxShadow = isSelected
         ? '0px 6px 10px 0px rgba(0,0,0,.14),0px 1px 18px 0px rgba(0,0,0,.12),0px 3px 5px -1px rgba(0,0,0,.2)'
         : 'none'
      return {
         style: {
            opacity: eventOpacity,
            backgroundColor: backgroundColor,
            border: 'none',
            color: '#1A202C', // TODO: put in const
            boxShadow: boxShadow,
            outline: 'none'
         }
      }
   }, [])
   useEffect(() => {
      const initialRange = [
         firstVisibleDay(defaultDate, localizer),
         lastVisibleDay(defaultDate, localizer)
      ]
      loadCalendarAction(initialRange, tasks)
   }, [defaultDate, loadCalendarAction, localizer, tasks])

   return (
      <Skeleton isLoaded={!loading}>
         <VStack
            // w='fit-content'
            h='800px'
            // minW='full'
            alignItems='center'
            gap={0}
            paddingBottom={10}
         >
            <Toolbar />
            <BigCalendar
               components={components}
               defaultDate={defaultDate}
               events={visibleEvents || []}
               defaultView='week'
               localizer={localizer}
               showMultiDayTimes
               step={30}
               views={views}
               scrollToTime={scrollToTime}
               onRangeChange={onRangeChange}
               eventPropGetter={eventPropGetter}
               popup
            />
         </VStack>
      </Skeleton>
   )
}

Calendar.propTypes = {
   loadCalendarAction: PropTypes.func.isRequired,
   localizer: PropTypes.instanceOf(DateLocalizer),
   googleAccount: PropTypes.object.isRequired,
   tasks: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
   googleAccount: state.googleAccount,
   tasks: state.page.tasks
})

export default connect(mapStateToProps, { loadCalendarAction })(Calendar)
