import React, { useCallback, useEffect, useMemo } from 'react'

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
   endOfDay,
   firstVisibleDay,
   lastVisibleDay,
   startOfDay
} from '../../utils/dates'

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
   const onRangeChange = useCallback((range) => {
      if (!range) {
         return
      }
      if (!Array.isArray(range)) {
         const reqData = {
            minDate: range.start,
            maxDate: range.end
         }
         listGoogleEvents(reqData)
         return
      }
      if (range.length === 1) {
         const reqData = {
            minDate: startOfDay(range[0]),
            maxDate: endOfDay(range[0])
         }
         listGoogleEvents(reqData)
         return
      }
      const reqData = {
         minDate: range[0],
         maxDate: range[6]
      }
      listGoogleEvents(reqData)
   }, [])

   useEffect(() => {
      const reqData = {
         minDate: firstVisibleDay(defaultDate, localizer),
         maxDate: lastVisibleDay(defaultDate, localizer)
      }
      listGoogleEvents(reqData)
   }, [])
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
