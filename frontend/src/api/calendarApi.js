import { baseApi } from './baseApi'

export const calendarApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCalendar: builder.query({
      query: ({ range, pageId }) => ({
        url: '/calendar',
        params: {
          start: range[0],
          end: range[1],
          pageId
        }
      }),
      providesTags: ['Calendar']
    }),

    // Account Management
    addCalendarAccount: builder.mutation({
      query: (accountData) => ({
        url: '/calendar/account',
        method: 'POST',
        body: accountData
      }),
      invalidatesTags: ['Calendar']
    }),

    removeCalendarAccount: builder.mutation({
      query: ({ accountEmail }) => ({
        url: `/calendar/account/${accountEmail}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Calendar']
    }),

    setDefaultAccount: builder.mutation({
      query: ({ accountEmail }) => ({
        url: '/calendar/account/default',
        method: 'PATCH',
        body: { accountEmail }
      }),
      invalidatesTags: ['Calendar']
    }),

    // Event Management
    createCalendarEvent: builder.mutation({
      query: (eventData) => ({
        url: '/calendar/event',
        method: 'POST',
        body: eventData
      }),
      invalidatesTags: ['Calendar']
    }),

    updateCalendarEvent: builder.mutation({
      query: ({ eventId, ...updates }) => ({
        url: `/calendar/event/${eventId}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: ['Calendar']
    }),

    deleteCalendarEvent: builder.mutation({
      query: ({ eventId }) => ({
        url: `/calendar/event/${eventId}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Calendar']
    }),

    updateCalendarVisibility: builder.mutation({
      query: ({ calendarId, visible }) => ({
        url: `/calendar/${calendarId}/visibility`,
        method: 'PATCH',
        body: { visible }
      }),
      // Optimistic update
      onQueryStarted: async ({ calendarId, visible }, { dispatch, queryFulfilled }) => {
        const patchResult = dispatch(
          calendarApi.util.updateQueryData('getCalendar', undefined, (draft) => {
            const calendar = draft.googleCalendars?.find(cal => cal.id === calendarId)
            if (calendar) {
              calendar.visible = visible
            }
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      }
    })
  })
})

export const {
  useGetCalendarQuery,
  useAddCalendarAccountMutation,
  useRemoveCalendarAccountMutation,
  useSetDefaultAccountMutation,
  useCreateCalendarEventMutation,
  useUpdateCalendarEventMutation,
  useDeleteCalendarEventMutation,
  useUpdateCalendarVisibilityMutation
} = calendarApi