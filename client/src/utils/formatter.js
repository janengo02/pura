import moment from 'moment'

export const stringToDateTimeLocal = (dString) => {
   const d = moment(dString).format('YYYY-MM-DDTkk:mm')
   return d
}

export const calendarPage = (page, googleEvents) => {
   const events = []
   googleEvents?.forEach((event) => {
      const newStart = Date.parse(event.start.dateTime)
      const newEnd = Date.parse(event.end.dateTime)
      events.push({
         id: event._id,
         title: event.summary,
         start: new Date(newStart),
         end: new Date(newEnd)
      })
   })
   page?.tasks?.forEach((task) => {
      task?.schedule?.forEach((event, index) => {
         const newStart = Date.parse(event.start)
         const newEnd = Date.parse(event.end)
         events.push({
            id: task._id,
            title:
               task.title +
               ' (' +
               (index + 1) +
               '/' +
               task.schedule.length +
               ')',
            start: new Date(newStart),
            end: new Date(newEnd)
         })
      })
   })
   return events
}
