import moment from 'moment'

export const stringToDateTimeLocal = (dString) => {
   const d = moment(dString).format('YYYY-MM-DDTkk:mm')
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
