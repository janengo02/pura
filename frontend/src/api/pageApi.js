import { baseApi } from './baseApi'
import { optimisticMoveTask, optimisticUpdateGroup, optimisticUpdateProgress, optimisticDeleteGroup, optimisticDeleteProgress } from '../reducers/pageSlice'
import { commonErrorHandler } from '../actions/errorActions'

export const pageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFirstPage: builder.query({
      query: () => '/page',
      providesTags: ['Page']
    }),

    getPage: builder.query({
      query: (pageId) => `/page/${pageId}`,
      providesTags: ['Page']
    }),

    // Progress Management
    createProgress: builder.mutation({
      query: ({ pageId, ...progressData }) => ({
        url: `/progress/new/${pageId}`,
        method: 'POST',
        body: progressData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page']
    }),

    updateProgress: builder.mutation({
      query: ({ pageId, progressId, ...updates }) => ({
        url: `/progress/update/${pageId}/${progressId}`,
        method: 'POST',
        body: updates
      }),
      async onQueryStarted({ progressId, ...updates }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately update the UI
        dispatch(optimisticUpdateProgress({ progressId, ...updates }))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page']
    }),

    deleteProgress: builder.mutation({
      query: ({ pageId, progressId }) => ({
        url: `/progress/${pageId}/${progressId}`,
        method: 'DELETE'
      }),
      async onQueryStarted({ progressId }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately remove the progress from UI
        dispatch(optimisticDeleteProgress({ progressId }))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page', 'Calendar']
    }),

    // Group Management
    createGroup: builder.mutation({
      query: ({ pageId, ...groupData }) => ({
        url: `/group/new/${pageId}`,
        method: 'POST',
        body: groupData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page']
    }),

    updateGroup: builder.mutation({
      query: ({ pageId, groupId, ...updates }) => ({
        url: `/group/update/${pageId}/${groupId}`,
        method: 'POST',
        body: updates
      }),
      async onQueryStarted({ groupId, ...updates }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately update the UI
        dispatch(optimisticUpdateGroup({ groupId, ...updates }))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page']
    }),

    deleteGroup: builder.mutation({
      query: ({ pageId, groupId }) => ({
        url: `/group/${pageId}/${groupId}`,
        method: 'DELETE'
      }),
      async onQueryStarted({ groupId }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately remove the group from UI
        dispatch(optimisticDeleteGroup({ groupId }))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page', 'Calendar']
    }),

    // Task Management
    dropTask: builder.mutation({
      query: ({ pageId, ...taskData }) => ({
        url: `/page/move-task/${pageId}`,
        method: 'POST',
        body: taskData
      }),
      async onQueryStarted({ result }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately update the UI
        dispatch(optimisticMoveTask(result))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page']
    })
  })
})

export const {
  useGetFirstPageQuery,
  useLazyGetFirstPageQuery,
  useGetPageQuery,
  useCreateProgressMutation,
  useUpdateProgressMutation,
  useDeleteProgressMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useDropTaskMutation,
} = pageApi