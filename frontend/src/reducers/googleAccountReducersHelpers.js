// =============================================
// Add Google Account State Transform Functions
// =============================================
export const addGoogleAccountListHelper = (
   currentGoogleAccounts,
   newGoogleAccount
) => {
   const isExistingAccount = currentGoogleAccounts.find(
      (acc) => acc.accountId === newGoogleAccount._id
   )
   if (isExistingAccount) {
      return currentGoogleAccounts.map((acc) =>
         acc.accountId === newGoogleAccount._id
            ? { ...acc, accountSyncStatus: newGoogleAccount.sync_status }
            : acc
      )
   } else {
      return [
         ...currentGoogleAccounts,
         {
            accountId: newGoogleAccount._id,
            accountEmail: newGoogleAccount.account_email,
            accountSyncStatus: newGoogleAccount.sync_status
         }
      ]
   }
}
export const addGoogleAccountCalendarListHelper = (
   currentCalendarList,
   newAccountCalendars
) => {
   const calendars = currentCalendarList.filter(
      (c) => c.accountId !== newAccountCalendars._id
   )
   return [
      ...calendars,
      ...newAccountCalendars.calendars.map((calendar) => {
         const currentCalendarSelected = currentCalendarList.find(
            (c) => c.calendarId === calendar.id
         )
         return {
            accountId: newAccountCalendars._id,
            calendarId: calendar.id,
            title: calendar.summary,
            color: calendar.backgroundColor,
            accessRole: calendar.accessRole,
            isPrimary: calendar.primary || false,
            selected: currentCalendarSelected
               ? currentCalendarSelected.selected
               : calendar.selected || false
         }
      })
   ]
}

export const addGoogleAccountEventListHelper = (
   currentCalendarEvents,
   newGoogleAccountEvents
) => {
   const events = currentCalendarEvents.filter(
      (ev) => ev.accountId !== newGoogleAccountEvents._id
   )
   newGoogleAccountEvents.calendars.forEach((calendar) => {
      calendar?.items?.forEach((event) => {
         // @todo: Deal with full date events
         if (
            event.start?.hasOwnProperty('dateTime') &&
            event.end?.hasOwnProperty('dateTime')
         ) {
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
               calendarVisible: calendar
                  ? calendar.selected
                  : calendar.selected || false,
               accountId: newGoogleAccountEvents._id
            })
         }
      })
   })

   return events
}

export const addGoogleAccount = ({
   googleAccounts,
   googleCalendars,
   googleEvents,
   newGoogleAccount
}) => {
   return {
      googleAccounts: addGoogleAccountListHelper(
         googleAccounts,
         newGoogleAccount
      ),
      googleCalendars: addGoogleAccountCalendarListHelper(
         googleCalendars,
         newGoogleAccount
      ),
      googleEvents: addGoogleAccountEventListHelper(
         googleEvents,
         newGoogleAccount
      )
   }
}

// =============================================
// Load Google Calendar State Transform Functions
// =============================================
export const loadAccountListHelper = (googleAccounts) => {
   const accounts = []
   googleAccounts.forEach((account) => {
      accounts.push({
         accountId: account._id,
         accountEmail: account.account_email,
         accountSyncStatus: account.sync_status
      })
   })
   return accounts
}
export const loadCalendarListHelper = (googleAccounts) => {
   const calendars = []
   googleAccounts.forEach((account) => {
      account.calendars.forEach((calendar) => {
         calendars.push({
            accountId: account._id,
            calendarId: calendar.id,
            title: calendar.summary,
            color: calendar.backgroundColor,
            accessRole: calendar.accessRole,
            isPrimary: calendar.primary || false,
            selected: calendar ? calendar.selected : calendar.selected || false
         })
      })
   })

   return calendars
}
export const loadEventListHelper = (googleAccounts, tasks) => {
   const events = []
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
   googleAccounts.forEach((account) => {
      account.calendars.forEach((calendar) => {
         calendar?.items?.forEach((event) => {
            // @todo: Deal with full date events
            if (
               event.start?.hasOwnProperty('dateTime') &&
               event.end?.hasOwnProperty('dateTime')
            ) {
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
                  calendarVisible: calendar
                     ? calendar.selected
                     : calendar.selected || false,
                  accountId: account._id
               })
            }
         })
      })
   })

   return events
}
export const loadGoogleCalendar = ({ googleAccounts, tasks }) => {
   return {
      googleAccounts: loadAccountListHelper(googleAccounts),
      googleCalendars: loadCalendarListHelper(googleAccounts),
      googleEvents: loadEventListHelper(googleAccounts, tasks)
   }
}

// =============================================
// Change Google Calendar Visibility State Transform Functions
// =============================================
export const changeVisibilityCalendarListHelper = (
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

export const changeVisibilityEventListHelper = (
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

export const changeGoogleCalendarVisibility = ({
   googleCalendars,
   googleEvents,
   calendarId
}) => {
   return {
      googleCalendars: changeVisibilityCalendarListHelper(
         googleCalendars,
         calendarId
      ),
      googleEvents: changeVisibilityEventListHelper(googleEvents, calendarId)
   }
}
// =============================================
// Update Google Event State Transform Functions
// =============================================
export const updateGoogleEvent = ({ googleEvents, updatedEvent }) => {
   if (updatedEvent.deleted) {
      return googleEvents.filter((ev) => ev.id !== updatedEvent.id)
   }
   const updatedEventList = googleEvents
   const newStart = Date.parse(updatedEvent.start.dateTime)
   const newEnd = Date.parse(updatedEvent.end.dateTime)
   const updatedEventIndex = googleEvents.findIndex(
      (ev) => ev.id === updatedEvent.id
   )
   updatedEventList[updatedEventIndex].start = new Date(newStart)
   updatedEventList[updatedEventIndex].end = new Date(newEnd)
   return { googleEvents: updatedEventList }
}

// =============================================
// Add Google Event State Transform Functions
// =============================================
export const addGoogleEvent = ({
   googleCalendars,
   googleEvents,
   accountId,
   newEvent
}) => {
   // Find the primary calendar for the given accountId
   const calendar = googleCalendars.find(
      (acc) => acc.accountId === accountId && acc.isPrimary
   )

   if (!calendar) {
      // If no primary calendar found, just return the current list
      return googleEvents
   }

   const newStart = Date.parse(newEvent.start.dateTime)
   const newEnd = Date.parse(newEvent.end.dateTime)

   const eventToAdd = {
      id: newEvent.id,
      title: newEvent.summary,
      start: new Date(newStart),
      end: new Date(newEnd),
      calendarId: calendar.calendarId,
      calendar: calendar.title,
      color: calendar.color,
      accessRole: calendar.accessRole,
      calendarVisible: calendar.selected || false,
      accountId: accountId
   }

   const updatedEventList = [...googleEvents, eventToAdd]
   return { googleEvents: updatedEventList }
}
