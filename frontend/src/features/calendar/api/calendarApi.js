import { baseApi } from '../../../shared/api/baseApi'
import { commonErrorHandler } from '../../error/errorHandlerHelpers'
import { refetchTaskModal } from '../../task/api/taskApi'
import {  optimisticDeleteGoogleEvent as calendarSliceOptimisticDeleteGoogleEvent,
          optimisticUpdateGoogleEventTime as calendarSliceOptimisticUpdateGoogleEventTime,
          optimisticUpdateGoogleEvent as calendarSliceOptimisticUpdateGoogleEvent} from '../calendarSlice'
import { optimisticUpdateTaskSchedule as taskSliceOptimisticUpdateTaskSchedule } from '../../task/taskSlice'

export const calendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loadCalendar: builder.query({
      query: ({ minDate, maxDate, pageId }) => ({
        url: '/calendar/list-events',
        params: {
          minDate: minDate instanceof Date ? minDate.toISOString() : minDate,
          maxDate: maxDate instanceof Date ? maxDate.toISOString() : maxDate,
          pageId
        }
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
          refetchTaskModal(dispatch, getState, baseApi)
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchTaskModal: true,
            refetchPage: true
          })
        }
      },
      providesTags: ['Calendar'],
    }),

    setDefaultAccount: builder.mutation({
      query: ({ accountEmail }) => ({
        url: `/calendar/set-default/${accountEmail}`,
        method: 'PUT'
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchCalendar: true,
          })
        }
      },
    }),

    addGoogleAccount: builder.mutation({
      query: (reqData) => ({
        url: '/calendar/add-account',
        method: 'POST',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
          refetchTaskModal(dispatch, getState, baseApi)
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchCalendar: true,
          })
        }
      },
    }),

    disconnectGoogleAccount: builder.mutation({
      query: ({ accountEmail }) => ({
        url: `/calendar/disconnect/${accountEmail}`,
        method: 'DELETE'
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
          refetchTaskModal(dispatch, getState, baseApi)
          refetchCalendar(dispatch, getState, baseApi)
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchCalendar: true,
          })
        }
      },
    }),

    createGoogleEvent: builder.mutation({
      query: (reqData) => ({
        url: '/calendar/create-event',
        method: 'POST',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchCalendar: true,
          })
        }
      },
    }),

    deleteGoogleEvent: builder.mutation({
      query: ({ eventId, ...reqData }) => ({
        url: `/calendar/delete-event/${eventId}`,
        method: 'DELETE',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        dispatch(calendarSliceOptimisticDeleteGoogleEvent({
          id: arg.eventId
        }))
        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchCalendar: true,
          })
        }
      }
    }),

    updateGoogleEventTime: builder.mutation({
      query: ({ eventId, ...reqData }) => ({
        url: `/calendar/update-event/${eventId}`,
        method: 'POST',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - Calendar - update event times in state
        dispatch(calendarSliceOptimisticUpdateGoogleEventTime({
          eventId: arg.eventId,
          start: arg.start ? { dateTime: arg.start } : undefined,
          end: arg.end ? { dateTime: arg.end } : undefined
        }))

        // If this is a task event, also update task schedule optimistically
        if (arg.taskId && typeof arg.slotIndex === 'number') {
          dispatch(taskSliceOptimisticUpdateTaskSchedule({
            taskId: arg.taskId,
            slotIndex: arg.slotIndex,
            start: arg.start,
            end: arg.end,
            updateDate: new Date().toISOString(),
            targetEventIndex: arg.targetEventIndex,
            viewTargetEventAt: new Date()
          }))
        }
        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchTaskModal: true,
            refetchCalendar: true,
          })
        }
      },
    }),

    updateGoogleEvent: builder.mutation({
      query: ({ eventId, ...reqData }) => ({
        url: `/calendar/update-event/${eventId}`,
        method: 'POST',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        // Create optimistic update payload
        const optimisticEventData = {
          id: arg.eventId,
          summary: arg.summary,
          description: arg.description,
          location: arg.location,
          colorId: arg.colorId,
          start: arg.start ? { dateTime: arg.start } : undefined,
          end: arg.end ? { dateTime: arg.end } : undefined,
          conferenceData: {
            conferenceSolution: {
              key: {
                type: 'hangoutsMeet'
              }
            },
            conferenceId: arg.conferenceData?.id,
            entryPoints: [
              {
                entryPointType: 'video',
                uri: arg.conferenceData?.joinUrl
              }
            ]
          }
        }

        // Get target calendar for optimistic update
        const optimisticCalendar = {
          id: arg.calendarId || arg.originalCalendarId,
          summary: arg.calendarSummary || 'Calendar',
          backgroundColor: arg.calendarBackgroundColor || '#3174ad'
        }

        // Optimistic update - Calendar - update event in state
        dispatch(calendarSliceOptimisticUpdateGoogleEvent({
          event: optimisticEventData,
          calendar: optimisticCalendar,
          originalEventId: arg.eventId
        }))

        // If this is a task event, also update task schedule optimistically
        if (arg.taskId && typeof arg.slotIndex === 'number') {
          dispatch(taskSliceOptimisticUpdateTaskSchedule({
            taskId: arg.taskId,
            slotIndex: arg.slotIndex,
            start: arg.start,
            end: arg.end,
            updateDate: new Date().toISOString(),
            targetEventIndex: arg.targetEventIndex,
            viewTargetEventAt: new Date()
          }))
        }

        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchTaskModal: true,
            refetchCalendar: true,
          })
        }
      },
    }),

    submitTestUserRequest: builder.mutation({
      query: ({ email }) => ({
        url: '/calendar/request-test-access',
        method: 'POST',
        body: { email }
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {})
        }
      },
    }),
  })
})

/**
 * Utility function to refetch calendar data
 * This can be used across multiple RTK Query mutations to ensure
 * calendar data stays up-to-date after API operations
 *
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} getState - Redux getState function
 * @param {Object} baseApi - RTK Query base API instance
 */
export const refetchCalendar = (dispatch, getState, baseApi) => {
  const state = getState()
  const range = state.calendarSlice?.range
  const pageId = state.pageSlice?.id

  if (range && range.length >= 2 && pageId) {
    // Manually trigger calendar refetch to get updated data with force refresh
    dispatch(baseApi.endpoints.loadCalendar.initiate({
      minDate: range[0],
      maxDate: range[1],
      pageId: pageId
    }, {
      forceRefetch: true
    }))
  }
}

export const {
  useLazyLoadCalendarQuery,
  useSetDefaultAccountMutation,
  useAddGoogleAccountMutation,
  useDisconnectGoogleAccountMutation,
  useCreateGoogleEventMutation,
  useDeleteGoogleEventMutation,
  useUpdateGoogleEventTimeMutation,
  useUpdateGoogleEventMutation,
  useSubmitTestUserRequestMutation,
} = calendarApi