import { baseApi } from './baseApi'
import { commonErrorHandler } from '../actions/errorActions'

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    showTaskModal: builder.mutation({
      query: ({ pageId, taskId }) => ({
        url: `/task/${pageId}/${taskId}`,
        method: 'GET'
      }),
      transformResponse: (response, meta, arg) => {
        // Add targetEventIndex and viewTargetEventAt if provided
        return {
          ...response,
          ...(typeof arg.targetEventIndex === 'number' && {
            targetEventIndex: arg.targetEventIndex,
            viewTargetEventAt: new Date()
          })
        }
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      providesTags: ['Task']
    }),

    createTask: builder.mutation({
      query: ({ pageId, ...taskData }) => ({
        url: `/task/new/${pageId}`,
        method: 'POST',
        body: taskData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page']
    }),

    updateTaskBasic: builder.mutation({
      query: ({ pageId, taskId, ...updates }) => ({
        url: `/task/${pageId}/${taskId}`,
        method: 'PATCH',
        body: updates
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Task', 'Page', 'Calendar']
    }),

    deleteTask: builder.mutation({
      query: ({ pageId, taskId }) => ({
        url: `/task/${pageId}/${taskId}`,
        method: 'DELETE'
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Task', 'Page', 'Calendar']
    }),

  })
})

export const {
  useShowTaskModalMutation,
  useCreateTaskMutation,
  useUpdateTaskBasicMutation,
  useDeleteTaskMutation,
} = taskApi

/**
 * Utility function to refetch task modal data if it's currently open
 * This can be used across multiple RTK Query mutations to ensure
 * task modal data stays up-to-date after API operations
 *
 * @param {Function} dispatch - Redux dispatch function
 * @param {Function} getState - Redux getState function
 * @param {Object} baseApi - RTK Query base API instance
 */
export const refetchTaskModalIfOpen = (dispatch, getState, baseApi) => {
  const state = getState()
  const task = state.taskSlice?.task
  const pageId = state.pageSlice?.id

  if (task && pageId) {
    // Manually trigger task modal refetch to get updated data
    dispatch(baseApi.endpoints.showTaskModal.initiate({
      taskId: task.id,
      pageId: pageId
    }))
  }
}