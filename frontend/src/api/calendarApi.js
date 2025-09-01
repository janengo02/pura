import { baseApi } from './baseApi'
import { commonErrorHandler } from '../actions/errorActions'
import { refetchTaskModalIfOpen } from './taskApi'

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
  })
})

export const {
  useLazyLoadCalendarQuery,
  useSetDefaultAccountMutation,
  useAddGoogleAccountMutation,
  useDisconnectGoogleAccountMutation,
} = calendarApi