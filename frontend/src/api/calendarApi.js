import { baseApi } from './baseApi'
import { commonErrorHandler } from '../actions/errorActions'

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
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
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
  })
})

export const {
  useLazyLoadCalendarQuery,
  useSetDefaultAccountMutation,
} = calendarApi