export const SCHEDULE_SYNCE_STATUS = {
   NONE: '0', // No sync event (no google_event_id)
   SYNCED: '1', // Event synced with Google Calendar
   ACCOUNT_NOT_CONNECTED: '2', // Google account not connected
   EVENT_NOT_FOUND: '3', // Event not found in Google Calendar
   NOT_SYNCED: '4', // Event not synced with Google Calendar (Schedule is mismatched)
   SYNC_ERROR: '5' // Error during sync operation
}
