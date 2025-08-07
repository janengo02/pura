const { google } = require('googleapis')

/**
 * Create new OAuth2 client
 * @returns {Object} Google OAuth2 client instance
 */
const newOath2Client = () =>
   new google.auth.OAuth2(
      process.env?.GOOGLE_CLIENT_ID,
      process.env?.GOOGLE_CLIENT_SECRET,
      process.env?.APP_PATH
   )

/**
 * Set OAuth credentials with refresh token
 * @param {string} refreshToken - Google refresh token
 * @returns {Object} Configured OAuth2 client
 */
const setOAuthCredentials = (refreshToken) => {
   const oath2Client = newOath2Client()
   oath2Client.setCredentials({ refresh_token: refreshToken })
   return oath2Client
}

/**
 * Fetch calendar events from Google Calendar
 * @param {Object} oath2Client - OAuth2 client
 * @param {string} calendarId - Calendar ID
 * @param {string} minDate - Start date for events
 * @param {string} maxDate - End date for events
 * @returns {Object} Calendar events data
 */
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
      showHiddenInvitations: true,
      fields:
         'items(id,summary,description,start,end,location,attendees,conferenceData,reminders,recurrence,visibility,transparency,status,creator,organizer,created,updated,htmlLink,hangoutLink,extendedProperties,source,etag,sequence,locked,privateCopy,guestsCanInviteOthers,guestsCanModify,guestsCanSeeOtherGuests,colorId)'
   })
   return event.data
}

/**
 * List events from all calendars for a Google account
 * @param {string} refreshToken - Google refresh token
 * @param {string} minDate - Start date for events
 * @param {string} maxDate - End date for events
 * @returns {Array} Array of calendar events
 */
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

/**
 * Update sync status for Google accounts
 * @param {Object} user - User object
 * @param {Array} notSyncedAccounts - Array of account IDs that failed to sync
 * @returns {void}
 */
const updateGoogleAccountSyncStatus = (user, notSyncedAccounts) => {
   user.google_accounts = user.google_accounts.map((acc) =>
      notSyncedAccounts.includes(acc._id)
         ? { ...acc, sync_status: false }
         : { ...acc, sync_status: true }
   )
   user.update_date = new Date()
   user.save()
}

/**
 * Ensure only one default account exists
 * @param {Object} user - User object
 * @param {String} newDefaultAccountEmail - Email of the new default account
 */
const ensureSingleDefaultAccount = async (user, newDefaultAccountEmail) => {
   user.google_accounts = user.google_accounts.map((account) => ({
      ...account,
      is_default: account.account_email === newDefaultAccountEmail
   }))
   user.update_date = new Date()
   await user.save()
}

/**
 * Set default account automatically for single account
 * @param {Object} user - User object
 */
const autoSetDefaultForSingleAccount = async (user) => {
   if (user.google_accounts.length === 1) {
      user.google_accounts[0].is_default = true
      user.update_date = new Date()
      await user.save()
   }
}

module.exports = {
   newOath2Client,
   setOAuthCredentials,
   fetchCalendarEvents,
   listEvent,
   updateGoogleAccountSyncStatus,
   ensureSingleDefaultAccount,
   autoSetDefaultForSingleAccount
}
