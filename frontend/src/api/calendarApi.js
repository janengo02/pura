import { baseApi } from './baseApi'
import { commonErrorHandler } from '../actions/errorActions'
import { refetchTaskModalIfOpen } from './taskApi'
import { optimisticDeleteGoogleEvent, optimisticUpdateGoogleEventTime } from '../reducers/calendarSlice'
import { optimisticUpdateTaskSchedule } from '../reducers/taskSlice'

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
          // After successful calendar load, refetch task modal if open
          refetchTaskModalIfOpen(dispatch, getState, baseApi)
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      providesTags: ['Calendar'],
      invalidatesTags: ['Task']
    }),

    setDefaultAccount: builder.mutation({
      query: ({ accountEmail }) => ({
        url: `/calendar/set-default/${accountEmail}`,
        method: 'PUT'
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Calendar']
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
          // After successful Google account addition, refetch task modal if open
          refetchTaskModalIfOpen(dispatch, getState, baseApi)
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Calendar', 'Task']
    }),

    disconnectGoogleAccount: builder.mutation({
      query: ({ accountEmail }) => ({
        url: `/calendar/disconnect/${accountEmail}`,
        method: 'DELETE'
      }),
      async onQueryStarted({ accountEmail }, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled

          // After successful Google account disconnection, refetch task modal if open
          refetchTaskModalIfOpen(dispatch, getState, baseApi)
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Calendar', 'Task']
    }),

    createGoogleEvent: builder.mutation({
      query: (reqData) => ({
        url: '/calendar/create-event',
        method: 'POST',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
          throw err
        }
      },
      invalidatesTags: []
    }),

    deleteGoogleEvent: builder.mutation({
      query: ({ eventId, ...reqData }) => ({
        url: `/calendar/delete-event/${eventId}`,
        method: 'DELETE',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Perform optimistic update immediately
        dispatch(optimisticDeleteGoogleEvent({
          id: arg.eventId
        }))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Calendar']
    }),

    updateGoogleEventTime: builder.mutation({
      query: ({ eventId, ...reqData }) => ({
        url: `/calendar/update-event/${eventId}`,
        method: 'POST',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Optimistic update - Calendar - update event times in state
        dispatch(optimisticUpdateGoogleEventTime({
          eventId: arg.eventId,
          start: arg.start ? { dateTime: arg.start } : undefined,
          end: arg.end ? { dateTime: arg.end } : undefined
        }))

        // If this is a task event, also update task schedule optimistically
        if (arg.taskId && typeof arg.slotIndex === 'number') {
          dispatch(optimisticUpdateTaskSchedule({
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
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: []
    }),
  })
})

export const {
  useLazyLoadCalendarQuery,
  useSetDefaultAccountMutation,
  useAddGoogleAccountMutation,
  useDisconnectGoogleAccountMutation,
  useCreateGoogleEventMutation,
  useDeleteGoogleEventMutation,
  useUpdateGoogleEventTimeMutation,
} = calendarApi