const { google } = require('googleapis')
const prisma = require('../config/prisma')

/**
 * Create new OAuth2 client
 * @returns {Object} Google OAuth2 client instance
 */
const newOath2Client = () =>
   new google.auth.OAuth2(
      process.env?.GOOGLE_CLIENT_ID,
      process.env?.GOOGLE_CLIENT_SECRET,
      process.env?.FRONTEND_URL
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
 * @returns {Promise<void>}
 */
const updateGoogleAccountSyncStatus = async (user, notSyncedAccounts) => {
   // Update each account's sync status individually
   const updatePromises = user.googleAccounts.map(async (acc) => {
      const newSyncStatus = !notSyncedAccounts.includes(acc.id)
      if (acc.syncStatus !== newSyncStatus) {
         await prisma.googleAccount.update({
            where: { id: acc.id },
            data: { syncStatus: newSyncStatus }
         })
      }
   })

   await Promise.all(updatePromises)

   // Update user's update date
   await prisma.user.update({
      where: { id: user.id },
      data: { updateDate: new Date() }
   })
}

/**
 * Ensure only one default account exists
 * @param {Object} user - User object
 * @param {String} newDefaultAccountEmail - Email of the new default account
 */
const ensureSingleDefaultAccount = async (user, newDefaultAccountEmail) => {
   // Update all accounts to set the correct default
   const updatePromises = user.googleAccounts.map(async (account) => {
      const shouldBeDefault = account.accountEmail === newDefaultAccountEmail
      if (account.isDefault !== shouldBeDefault) {
         await prisma.googleAccount.update({
            where: { id: account.id },
            data: { isDefault: shouldBeDefault }
         })
      }
   })

   await Promise.all(updatePromises)

   // Update user's update date
   await prisma.user.update({
      where: { id: user.id },
      data: { updateDate: new Date() }
   })
}

/**
 * Set default account automatically for single account
 * @param {Object} user - User object
 */
const autoSetDefaultForSingleAccount = async (user) => {
   if (user.googleAccounts.length === 1) {
      const account = user.googleAccounts[0]
      if (!account.isDefault) {
         await prisma.googleAccount.update({
            where: { id: account.id },
            data: { isDefault: true }
         })
      }

      // Update user's update date
      await prisma.user.update({
         where: { id: user.id },
         data: { updateDate: new Date() }
      })
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
