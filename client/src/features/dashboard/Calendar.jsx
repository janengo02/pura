import React, { useMemo } from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import moment from 'moment'
import {
   Calendar as BigCalendar,
   Views,
   DateLocalizer,
   momentLocalizer
} from 'react-big-calendar'
import * as dates from '../../utils/dates'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Skeleton, VStack } from '@chakra-ui/react'
import { calendarPage } from '../../utils/formatter'
import Toolbar from './calendar/toolbar/Toolbar'

const mLocalizer = momentLocalizer(moment)

const ColoredDateCellWrapper = ({ children }) =>
   React.cloneElement(React.Children.only(children), {
      style: {
         backgroundColor: 'white'
      }
   })

const Calendar = ({
   localizer = mLocalizer,
   page: { page, loading, error }
}) => {
   const { components, defaultDate, max, views } = useMemo(
      () => ({
         components: {
            timeSlotWrapper: ColoredDateCellWrapper
         },
         defaultDate: new Date(),
         max: dates.add(dates.endOf(new Date(2015, 17, 1), 'day'), -1, 'hours'),
         views: Object.keys(Views).map((k) => Views[k])
      }),
      []
   )

   return (
      <Skeleton isLoaded={!loading}>
         <VStack
            w='fit-content'
            h='800px'
            minW='full'
            alignItems='center'
            gap={0}
            paddingBottom={10}
         >
            <Toolbar />
            <BigCalendar
               components={components}
               defaultDate={defaultDate}
               events={calendarPage(page)}
               localizer={localizer}
               max={max}
               showMultiDayTimes
               step={60}
               views={views}
            />
         </VStack>
      </Skeleton>
   )
}

Calendar.propTypes = {
   localizer: PropTypes.instanceOf(DateLocalizer),
   page: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   page: state.page
})

export default connect(mapStateToProps, null)(Calendar)
