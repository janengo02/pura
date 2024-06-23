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

export const eventListFormatter = (currentCalendarList, googleCalendars) => {
   const events = []
   googleCalendars.forEach((calendar) => {
      calendar?.items?.forEach((event) => {
         // @todo: Deal with full date events
         if (
            event.start?.hasOwnProperty('dateTime') &&
            event.end?.hasOwnProperty('dateTime')
         ) {
            const currentCalendarSelected = currentCalendarList.find(
               (c) => c.calendarId === calendar.id
            )
            const newStart = Date.parse(event.start.dateTime)
            const newEnd = Date.parse(event.end.dateTime)
            events.push({
               id: event.id,
               title: event.summary,
               start: new Date(newStart),
               end: new Date(newEnd),
               calendarId: calendar.id,
               calendar: calendar.summary,
               color: calendar.backgroundColor,
               accessRole: calendar.accessRole,
               calendarVisible: currentCalendarSelected
                  ? currentCalendarSelected.selected
                  : calendar.selected || false
            })
         }
      })
   })

   return events
}
export const calendarListFormatter = (currentCalendarList, googleCalendars) => {
   const calendars = []
   googleCalendars.forEach((calendar) => {
      const currentCalendarSelected = currentCalendarList.find(
         (c) => c.calendarId === calendar.id
      )
      calendars.push({
         calendarId: calendar.id,
         title: calendar.summary,
         color: calendar.backgroundColor,
         accessRole: calendar.accessRole,
         isPrimary: calendar.primary || false,
         selected: currentCalendarSelected
            ? currentCalendarSelected.selected
            : calendar.selected || false
      })
   })

   return calendars
}

export const calendarOwnerFormatter = (googleCalendars) => {
   const owner = googleCalendars.find((c) => c.primary === true)
   if (typeof owner !== 'undefined') {
      return owner.id
   }

   return null
}

export const calendarListChangeVisibilityFormatter = (
   currentCalendarList,
   calendarId
) => {
   const calendars = currentCalendarList.map((c) =>
      c.calendarId === calendarId
         ? {
              ...c,
              selected: !c.selected
           }
         : c
   )
   return calendars
}

export const eventListChangeVisibilityFormatter = (
   currentEventList,
   calendarId
) => {
   const events = currentEventList.map((ev) =>
      ev.calendarId === calendarId
         ? {
              ...ev,
              calendarVisible: !ev.calendarVisible
           }
         : ev
   )
   return events
}

export const newEventFormatter = (newEvent, currentCalendarList) => {
   const primaryCalendar = currentCalendarList.find((c) => c.isPrimary)
   const newStart = Date.parse(newEvent.start.dateTime)
   const newEnd = Date.parse(newEvent.end.dateTime)
   return {
      id: newEvent.id,
      title: newEvent.summary,
      start: new Date(newStart),
      end: new Date(newEnd),
      calendarId: primaryCalendar.calendarId,
      calendar: primaryCalendar.title,
      color: primaryCalendar.color,
      accessRole: primaryCalendar.accessRole,
      calendarVisible: primaryCalendar.selected
   }
}
