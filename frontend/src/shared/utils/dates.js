import * as dates from 'date-arithmetic'
import moment from 'moment'

export const stringToDateTimeLocal = (dString) => {
   const d = moment(dString).format('YYYY-MM-DDTHH:mm')
   return d
}

export function getRangeStart(date, localizer) {
   const prevMonth = dates.add(date, -1, 'month')
   const firstOfPrevMonth = dates.startOf(prevMonth, 'month')

   return dates.startOf(firstOfPrevMonth, 'week', localizer.startOfWeek())
}

export function getRangeEnd(date, localizer) {
   const nextMonth = dates.add(date, +1, 'month')
   const endOfNextMonth = dates.endOf(nextMonth, 'month')

   return dates.endOf(endOfNextMonth, 'week', localizer.startOfWeek())
}