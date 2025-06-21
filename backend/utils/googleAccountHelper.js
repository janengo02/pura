const { google } = require('googleapis')

const newOath2Client = () =>
   new google.auth.OAuth2(
      process.env?.GOOGLE_CLIENT_ID,
      process.env?.GOOGLE_CLIENT_SECRET,
      process.env?.APP_PATH
   )

const setOAuthCredentials = (refreshToken) => {
   const oath2Client = newOath2Client()
   oath2Client.setCredentials({ refresh_token: refreshToken })
   return oath2Client
}

const fetchCalendarEvents = async (
   oath2Client,
   calendarId,
   minDate,
   maxDate
) => {
   const googleCalendarApi = google.calendar('v3')
   const event = await googleCalendarApi.events.list({
      auth: oath2Client,
      calendarId,
      timeMin: minDate,
      timeMax: maxDate,
      singleEvents: true,
      orderBy: 'startTime',
      showDeleted: false,
      showHiddenInvitations: true
   })
   return event.data
}

const listEvent = async (refreshToken, minDate, maxDate) => {
   try {
      const oath2Client = setOAuthCredentials(refreshToken)
      const googleCalendarApi = google.calendar('v3')
      const calendars = await googleCalendarApi.calendarList.list({
         auth: oath2Client,
         maxResults: 50,
         showDeleted: false
      })
      const events = await Promise.all(
         calendars.data.items.map(async (calendar) => {
            const eventData = await fetchCalendarEvents(
               oath2Client,
               calendar.id,
               minDate,
               maxDate
            )
            return { ...eventData, ...calendar }
         })
      )
      return events
   } catch (err) {
      return []
   }
}

const updateGoogleAccountSyncStatus = (user, notSyncedAccounts) => {
   user.google_accounts = user.google_accounts.map((acc) =>
      notSyncedAccounts.includes(acc._id)
         ? { ...acc, sync_status: false }
         : { ...acc, sync_status: true }
   )
   user.update_date = new Date()
   user.save()
}

module.exports = {
   newOath2Client,
   setOAuthCredentials,
   fetchCalendarEvents,
   listEvent,
   updateGoogleAccountSyncStatus
}
