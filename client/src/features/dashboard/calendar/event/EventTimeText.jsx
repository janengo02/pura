import React from 'react'
import { Text } from '@chakra-ui/react'
import {
   stringToDateTime,
   stringToWeekDateTime,
   stringToTime
} from '../../../../utils/formatter'

const EventTimeText = ({ start, end }) => {
   const startDate = stringToDateTime(start)
   const endDate = stringToDateTime(end)
   var eventTime = ''
   if (startDate === endDate) {
      eventTime = `${stringToWeekDateTime(start)} ${stringToTime(
         start
      )} - ${stringToTime(end)}`
   } else {
      eventTime = `${startDate} ${stringToTime(
         start
      )} - ${endDate} ${stringToTime(end)}`
   }
   return (
      <>
         <Text fontSize='sm'>{eventTime}</Text>
      </>
   )
}

export default EventTimeText
