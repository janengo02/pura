import React, { useCallback, useEffect, useMemo, useState } from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import moment from 'moment'
import {
   Calendar as BigCalendar,
   Views,
   DateLocalizer,
   momentLocalizer
} from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Skeleton, VStack } from '@chakra-ui/react'
import Toolbar from './calendar/toolbar/Toolbar'
import EventWrapper from './calendar/event/EventWrapper'
import { listGoogleEvents } from '../../actions/googleAccount'
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
   listGoogleEvents,
   localizer = mLocalizer,
   googleAccount: { googleEvents, loading }
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
   const [visibleRange, setVisibleRange] = useState([
      firstVisibleDay(defaultDate, localizer),
      lastVisibleDay(defaultDate, localizer)
   ])
   const onRangeChange = useCallback(
      (range) => {
         if (!range) {
            return
         }
         if (!Array.isArray(range)) {
            // Change month
            if (
               neq(range.start, visibleRange[0], 'day') ||
               neq(range.end, visibleRange[1], 'day')
            )
               setVisibleRange([range.start, range.end])
            return
         }
         if (!inRange(range[0], visibleRange[0], visibleRange[1], 'day')) {
            setVisibleRange([
               firstVisibleDay(range[0], localizer),
               lastVisibleDay(range[0], localizer)
            ])
         }
      },
      [visibleRange]
   )

   useEffect(() => {
      listGoogleEvents(visibleRange)
   }, [visibleRange])
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
               events={googleEvents || []}
               defaultView='week'
               localizer={localizer}
               showMultiDayTimes
               step={30}
               views={views}
               scrollToTime={scrollToTime}
               onRangeChange={onRangeChange}
               popup
            />
         </VStack>
      </Skeleton>
   )
}

Calendar.propTypes = {
   listGoogleEvents: PropTypes.func.isRequired,
   localizer: PropTypes.instanceOf(DateLocalizer),
   googleAccount: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   googleAccount: state.googleAccount
})

export default connect(mapStateToProps, { listGoogleEvents })(Calendar)
