import moment from 'moment'

export const stringToDateTimeLocal = (dString) => {
   const d = moment(dString).format('YYYY-MM-DDTkk:mm')
   return d
}

export const calendarPage = (page) => {
   const events = []
   page?.tasks.forEach((task) => {
      task.schedule.forEach((event, index) => {
         events.push({
            id: task._id,
            title:
               task.title +
               ' (' +
               (index + 1) +
               '/' +
               task.schedule.length +
               ')',
            start: event.start,
            end: event.end
         })
      })
   })
   console.log(events)

   return events
}
