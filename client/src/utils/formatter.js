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

export const eventListFormatter = (
   currentCalendarList,
   googleAccounts,
   tasks
) => {
   const events = []
   googleAccounts.forEach((account) => {
      account.calendars.forEach((calendar) => {
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
                     : calendar.selected || false,
                  accountId: account._id
               })
            }
         })
      })
   })

   tasks.forEach((task) => {
      task.schedule.forEach((slot, slotIndex) => {
         const newStart = Date.parse(slot.start)
         const newEnd = Date.parse(slot.end)
         events.push({
            id: task._id,
            pura_schedule_index: slotIndex,
            title: task.title,
            start: new Date(newStart),
            end: new Date(newEnd),
            calendarId: null,
            calendar: null,
            color: '#805AD5',
            accessRole: 'owner',
            calendarVisible: true,
            accountId: null
         })
      })
   })
   console.log(events)

   return events
}
export const calendarListFormatter = (currentCalendarList, googleAccounts) => {
   const calendars = []
   googleAccounts.forEach((account) => {
      account.calendars.forEach((calendar) => {
         const currentCalendarSelected = currentCalendarList.find(
            (c) => c.calendarId === calendar.id
         )
         calendars.push({
            accountId: account._id,
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

export const accountListFormatter = (googleAccounts) => {
   const accounts = []
   googleAccounts.forEach((account) => {
      if (account.calendars.length > 0) {
         accounts.push({
            accountId: account._id,
            accountEmail: calendarOwnerFormatter(account.calendars)
         })
      }
   })
   return accounts
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

export const updateEventFormatter = (currentEventList, updatedEvent) => {
   if (updatedEvent.deleted) {
      return currentEventList.filter((ev) => ev.id !== updatedEvent.id)
   }
   const updatedEventList = currentEventList
   const newStart = Date.parse(updatedEvent.start.dateTime)
   const newEnd = Date.parse(updatedEvent.end.dateTime)
   const updatedEventIndex = currentEventList.findIndex(
      (ev) => ev.id === updatedEvent.id
   )
   updatedEventList[updatedEventIndex].start = new Date(newStart)
   updatedEventList[updatedEventIndex].end = new Date(newEnd)
   return updatedEventList
}
