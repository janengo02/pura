import { baseApi } from './baseApi'

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
      providesTags: ['Calendar']
    })
  })
})

export const {
  useLazyLoadCalendarQuery
} = calendarApi