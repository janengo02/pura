import { baseApi } from '../../../shared/api/baseApi'
import {  optimisticMoveTask as pageSliceOptimisticMoveTask,
          optimisticUpdateGroup as pageSliceOptimisticUpdateGroup,
          optimisticUpdateProgress as pageSliceOptimisticUpdateProgress,
          optimisticDeleteGroup as pageSliceOptimisticDeleteGroup,
          optimisticDeleteProgress as pageSliceOptimisticDeleteProgress } from '../pageSlice'
import { commonErrorHandler } from '../../error/errorHandlerHelpers'
import { refetchCalendar } from '../../calendar/api/calendarApi'

export const pageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getFirstPage: builder.query({
      query: () => '/page',
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
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchPage: true,
          })
        }
      },
    }),

    updateProgress: builder.mutation({
      query: ({ pageId, progressId, ...updates }) => ({
        url: `/progress/update/${pageId}/${progressId}`,
        method: 'POST',
        body: updates
      }),
      async onQueryStarted({ progressId, ...updates }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately update the UI
        dispatch(pageSliceOptimisticUpdateProgress({ progressId, ...updates }))
        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchPage: true,
          })
        }
      },
    }),

    deleteProgress: builder.mutation({
      query: ({ pageId, progressId }) => ({
        url: `/progress/${pageId}/${progressId}`,
        method: 'DELETE'
      }),
      async onQueryStarted({ progressId }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately remove the progress from UI
        dispatch(pageSliceOptimisticDeleteProgress({ progressId }))
        try {
          await queryFulfilled
          refetchCalendar(dispatch, getState, baseApi)
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchPage: true,
            refetchCalendar: true
          })
        }
      },
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
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchPage: true,
          })
        }
      },
    }),

    updateGroup: builder.mutation({
      query: ({ pageId, groupId, ...updates }) => ({
        url: `/group/update/${pageId}/${groupId}`,
        method: 'POST',
        body: updates
      }),
      async onQueryStarted({ groupId, ...updates }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately update the UI
        dispatch(pageSliceOptimisticUpdateGroup({ groupId, ...updates }))
        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchPage: true,
          })
        }
      },
    }),

    deleteGroup: builder.mutation({
      query: ({ pageId, groupId }) => ({
        url: `/group/${pageId}/${groupId}`,
        method: 'DELETE'
      }),
      async onQueryStarted({ groupId }, { dispatch, queryFulfilled, getState }) {
        // Optimistic update - immediately remove the group from UI
        dispatch(pageSliceOptimisticDeleteGroup({ groupId }))
        try {
          await queryFulfilled
          refetchCalendar(dispatch, getState, baseApi)
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchPage: true,
            refetchCalendar: true
          })
        }
      },
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
        dispatch(pageSliceOptimisticMoveTask(result))

        try {
          await queryFulfilled
        } catch (err) {
          commonErrorHandler(dispatch, err, getState, baseApi, {
            refetchPage: true,
          })
        }
      },
    })
  })
})

/**
 * Utility function to refetch page data
 * This can be used across multiple RTK Query mutations to ensure
 * page data stays up-to-date after API operations
 *
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} getState - Redux getState function
 * @param {Object} baseApi - RTK Query base API instance
 */
export const refetchPage = (dispatch, _getState, baseApi) => {
  dispatch(baseApi.endpoints.getFirstPage.initiate(undefined, { forceRefetch: true }))
}

export const {
  useGetFirstPageQuery,
  useLazyGetFirstPageQuery,
  useCreateProgressMutation,
  useUpdateProgressMutation,
  useDeleteProgressMutation,
  useCreateGroupMutation,
  useUpdateGroupMutation,
  useDeleteGroupMutation,
  useDropTaskMutation,
} = pageApi