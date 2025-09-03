// =============================================================================
// IMPORTS
// =============================================================================

import { api } from '../utils'
import { commonErrorHandler } from './errorActions'
import {
   UPDATE_CALENDAR_EVENT,
   UPDATE_CALENDAR_EVENT_TIME,
   UPDATE_TASK_SCHEDULE
} from './types'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

// =============================================================================
// ACTION CREATORS
// =============================================================================


/**
 * Update Google Event Action
 * Updates an existing event in Google Calendar
 * @param {Object} reqData - Request data for event update
 * @param {string} reqData.eventId - Event ID to update
 * @param {string} reqData.accountEmail - Google account ID
 * @param {string} reqData.calendarId - Target calendar ID (for moves)
 * @param {string} reqData.originalCalendarId - Original calendar ID
 * @param {string} reqData.calendarSummary - Target calendar summary/name for optimistic updates
 * @param {string} reqData.calendarBackgroundColor - Target calendar background color for optimistic updates
 * @param {string} [reqData.taskId] - Task ID for synced events
 * @param {number} [reqData.slotIndex] - Slot index for synced events
 * @param {number} [reqData.targetEventIndex] - Target event index for task detail updates
 */
export const updateGoogleEventAction =
   (reqData) => async (dispatch, getState) => {
      try {
         // Optimistic update - Calendar - update event in state
         // Create optimistic update payload
         const optimisticEventData = {
            id: reqData.eventId,
            summary: reqData.summary,
            description: reqData.description,
            location: reqData.location,
            colorId: reqData.colorId,
            start: reqData.start ? { dateTime: reqData.start } : undefined,
            end: reqData.end ? { dateTime: reqData.end } : undefined,
            conferenceData: {
               conferenceSolution: {
                  key: {
                     type: 'hangoutsMeet'
                  }
               },
               conferenceId: reqData.conferenceData?.id,
               entryPoints: [
                  {
                     entryPointType: 'video',
                     uri: reqData.conferenceData?.joinUrl
                  }
               ]
            }
         }

         // Get target calendar for optimistic update
         const optimisticCalendar = {
            id: reqData.calendarId || reqData.originalCalendarId,
            summary: reqData.calendarSummary || 'Calendar',
            backgroundColor: reqData.calendarBackgroundColor || '#3174ad'
         }

         dispatch({
            type: UPDATE_CALENDAR_EVENT,
            payload: {
               event: optimisticEventData,
               calendar: optimisticCalendar,
               originalEventId: reqData.eventId
            }
         })

         if (reqData.taskId && typeof reqData.slotIndex === 'number') {
            // Optimistic update - Page | Task
            dispatch({
               type: UPDATE_TASK_SCHEDULE,
               payload: {
                  taskId: reqData.taskId,
                  slotIndex: reqData.slotIndex,
                  start: reqData.start,
                  end: reqData.end,
                  updateDate: new Date().toISOString(),
                  targetEventIndex: reqData.targetEventIndex,
                  viewTargetEventAt: new Date()
               }
            })
         }

         const res = await api.post(
            `/calendar/update-event/${reqData.eventId}`,
            reqData
         )

         // Dispatch actual update with server response
         if (res.data?.event) {
            dispatch({
               type: UPDATE_CALENDAR_EVENT,
               payload: { ...res.data, originalEventId: reqData.eventId }
            })
         } else {
            throw new Error(
               'Unexpected response format from /calendar/update-event'
            )
         }
      } catch (err) {
         // On error, we might want to revert the optimistic update
         // For now, just show the error - the next calendar refresh will correct the state
         commonErrorHandler(dispatch, err)
      }
   }

/**
 * Update Google Event Time Action (for drag/drop operations)
 * Updates only the start and end time of an event, preserving all other data
 * @param {Object} reqData - Request data for event time update
 * @param {string} reqData.eventId - Event ID to update
 * @param {string} reqData.start - New start time (ISO string)
 * @param {string} reqData.end - New end time (ISO string)
 * @param {string} reqData.accountEmail - Google account ID
 * @param {string} reqData.calendarId - Calendar ID where event exists
 * @param {string} reqData.originalCalendarId - Original calendar ID
 * @param {string} [reqData.taskId] - Task ID for synced events
 * @param {number} [reqData.slotIndex] - Slot index for synced events
 * @param {number} [reqData.targetEventIndex] - Target event index for task detail updates
 */
export const updateGoogleEventTimeAction =
   (reqData) => async (dispatch, getState) => {
      try {
         // Optimistic update - Calendar - update event times in state
         dispatch({
            type: UPDATE_CALENDAR_EVENT_TIME,
            payload: {
               eventId: reqData.eventId,
               start: reqData.start ? { dateTime: reqData.start } : undefined,
               end: reqData.end ? { dateTime: reqData.end } : undefined
            }
         })
         if (reqData.taskId && typeof reqData.slotIndex === 'number') {
            // Optimistic update - Page | Task
            dispatch({
               type: UPDATE_TASK_SCHEDULE,
               payload: {
                  taskId: reqData.taskId,
                  slotIndex: reqData.slotIndex,
                  start: reqData.start,
                  end: reqData.end,
                  updateDate: new Date().toISOString(),
                  targetEventIndex: reqData.targetEventIndex,
                  viewTargetEventAt: new Date()
               }
            })
         }

         // API call to update event times only
         await api.post(`/calendar/update-event/${reqData.eventId}`, reqData)
      } catch (err) {
         commonErrorHandler(dispatch, err)
      }
   }




