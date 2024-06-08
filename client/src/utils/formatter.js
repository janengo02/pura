import moment from 'moment'

export const stringToDateTimeLocal = (dString) => {
   const d = moment(dString).format('YYYY-MM-DDTkk:mm')
   return d
}
export const stringToDateTime = (dString) => {
   const d = moment(dString).format('MMMM DD, YYYY') //June 8, 2024
   return d
}

export const stringToWeekDateTime = (dString) => {
   const d = moment(dString).format('dddd, MMMM DD') //Wednesday, June 8
   return d
}

export const stringToTime = (dString) => {
   const d = moment(dString).format('LT') // 7:00PM
   return d
}

export const calendarPage = (googleEvents) => {
   const events = []
   googleEvents?.forEach((event) => {
      const newStart = Date.parse(event.start.dateTime)
      const newEnd = Date.parse(event.end.dateTime)
      events.push({
         id: event.id,
         title: event.summary,
         start: new Date(newStart),
         end: new Date(newEnd)
      })
   })
   return events
}
