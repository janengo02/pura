import moment from 'moment'
import { eqTime } from './dates'

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

export const eventListFormatter = (googleAccounts, tasks) => {
   const events = []
   let syncedGoogleEvents = []
   tasks.forEach((task) => {
      task.schedule.forEach((slot, slotIndex) => {
         const newStart = Date.parse(slot.start)
         const newEnd = Date.parse(slot.end)
         if (slot.sync_info.length > 0) {
            syncedGoogleEvents = [
               ...syncedGoogleEvents,
               ...slot.sync_info.map((si) => si.event_id)
            ]
         }
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
            accountId: null,
            syncInfo: slot.sync_info
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
               const syncedStart = new Date(newStart)
               const syncedEnd = new Date(newEnd)
               const isSyncedGoogleEvent = syncedGoogleEvents.includes(event.id)
               if (!isSyncedGoogleEvent) {
                  events.push({
                     id: event.id,
                     title: event.summary,
                     start: syncedStart,
                     end: syncedEnd,
                     calendarId: calendar.id,
                     calendar: calendar.summary,
                     color: calendar.backgroundColor,
                     accessRole: calendar.accessRole,
                     calendarVisible: calendar
                        ? calendar.selected
                        : calendar.selected || false,
                     accountId: account._id,
                     hideOriginalEvent: false
                  })
               } else {
                  const puraOriginalEventIndex = events.findIndex((ev) =>
                     ev.syncInfo.find((si) => si.event_id === event.id)
                  )
                  const isSyncError =
                     !eqTime(
                        syncedStart,
                        events[puraOriginalEventIndex].start
                     ) ||
                     !eqTime(syncedEnd, events[puraOriginalEventIndex].end) ||
                     event.summary !== events[puraOriginalEventIndex].title
                  events.push({
                     id: event.id,
                     title: event.summary,
                     start: syncedStart,
                     end: syncedEnd,
                     calendarId: calendar.id,
                     calendar: calendar.summary,
                     color: calendar.backgroundColor,
                     accessRole: calendar.accessRole,
                     calendarVisible: calendar
                        ? calendar.selected
                        : calendar.selected || false,
                     accountId: account._id,
                     hideOriginalEvent: !isSyncError,
                     eventSyncError: isSyncError,
                     puraEventId: isSyncError
                        ? events[puraOriginalEventIndex].id
                        : undefined
                  })

                  if (isSyncError) {
                     events[puraOriginalEventIndex].syncInfo = events[
                        puraOriginalEventIndex
                     ].syncInfo.map((si) =>
                        si.event_id === event.id
                           ? { ...si, slotSyncError: true }
                           : si
                     )
                  }
               }
            }
         })
      })
   })
   const unFoundEvents = syncedGoogleEvents.filter(
      (eventId) => !events.find((ev) => ev.id === eventId)
   )
   unFoundEvents.forEach((unFoundEventId) => {
      const puraOriginalEventIndex = events.findIndex((ev) =>
         ev.syncInfo.find((si) => si.event_id === unFoundEventId)
      )
      events[puraOriginalEventIndex].syncInfo = events[
         puraOriginalEventIndex
      ].syncInfo.map((si) =>
         si.event_id === unFoundEventId ? { ...si, slotSyncError: true } : si
      )
   })

   return events
}

export const addNewAccountEventListFormatter = (
   currentCalendarEvents,
   newGoogleAccountEvents
) => {
   const events = currentCalendarEvents.filter(
      (ev) => ev.accountId !== newGoogleAccountEvents._id
   )
   const syncedGoogleEvents = events
      .map((ev) => ev.syncInfo.map((si) => si.event_id))
      .flat()
   newGoogleAccountEvents.calendars.forEach((calendar) => {
      calendar?.items?.forEach((event) => {
         // @todo: Deal with full date events
         if (
            event.start?.hasOwnProperty('dateTime') &&
            event.end?.hasOwnProperty('dateTime')
         ) {
            const newStart = Date.parse(event.start.dateTime)
            const newEnd = Date.parse(event.end.dateTime)
            const syncedStart = new Date(newStart)
            const syncedEnd = new Date(newEnd)
            const isSyncedGoogleEvent = syncedGoogleEvents.includes(event.id)
            if (!isSyncedGoogleEvent) {
               events.push({
                  id: event.id,
                  title: event.summary,
                  start: syncedStart,
                  end: syncedEnd,
                  calendarId: calendar.id,
                  calendar: calendar.summary,
                  color: calendar.backgroundColor,
                  accessRole: calendar.accessRole,
                  calendarVisible: calendar
                     ? calendar.selected
                     : calendar.selected || false,
                  accountId: newGoogleAccountEvents._id,
                  hideOriginalEvent: false
               })
            } else {
               const puraOriginalEventIndex = events.findIndex((ev) =>
                  ev.syncInfo.find((si) => si.event_id === event.id)
               )
               const isSyncError =
                  !eqTime(syncedStart, events[puraOriginalEventIndex].start) ||
                  !eqTime(syncedEnd, events[puraOriginalEventIndex].end) ||
                  event.summary !== events[puraOriginalEventIndex].title

               events.push({
                  id: event.id,
                  title: event.summary,
                  start: syncedStart,
                  end: syncedEnd,
                  calendarId: calendar.id,
                  calendar: calendar.summary,
                  color: calendar.backgroundColor,
                  accessRole: calendar.accessRole,
                  calendarVisible: calendar
                     ? calendar.selected
                     : calendar.selected || false,
                  accountId: newGoogleAccountEvents._id,
                  hideOriginalEvent: !isSyncError,
                  eventSyncError: isSyncError,
                  puraEventId: isSyncError
                     ? events[puraOriginalEventIndex].id
                     : undefined
               })

               if (isSyncError) {
                  events[puraOriginalEventIndex].syncInfo = events[
                     puraOriginalEventIndex
                  ].syncInfo.map((si) =>
                     si.event_id === event.id
                        ? { ...si, slotSyncError: true }
                        : si
                  )
               }
            }
         }
      })
   })
   const unFoundEvents = syncedGoogleEvents.filter(
      (eventId) => !events.find((ev) => ev.id === eventId)
   )
   unFoundEvents.forEach((unFoundEventId) => {
      const puraOriginalEventIndex = events.findIndex((ev) =>
         ev.syncInfo.find((si) => si.event_id === unFoundEventId)
      )
      events[puraOriginalEventIndex].syncInfo = events[
         puraOriginalEventIndex
      ].syncInfo.map((si) =>
         si.event_id === unFoundEventId ? { ...si, slotSyncError: true } : si
      )
   })

   return events
}

export const calendarListFormatter = (googleAccounts) => {
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
export const addAccountCalendarListFormatter = (
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
      accounts.push({
         accountId: account._id,
         accountEmail: account.account_email,
         accountSyncStatus: account.sync_status
      })
   })
   return accounts
}

export const addNewAccountListFormatter = (
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
