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
   googleAccount: { googleEvents, loading, range }
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
               listGoogleEvents([newRange.start, newRange.end])
            return
         }
         if (!inRange(newRange[0], range[0], range[1], 'day')) {
            listGoogleEvents([
               firstVisibleDay(newRange[0], localizer),
               lastVisibleDay(newRange[0], localizer)
            ])
         }
      },
      [listGoogleEvents, localizer, range]
   )

   useEffect(() => {
      const initialRange = [
         firstVisibleDay(defaultDate, localizer),
         lastVisibleDay(defaultDate, localizer)
      ]
      listGoogleEvents(initialRange)
   }, [defaultDate, listGoogleEvents, localizer])
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
