import { baseApi } from './baseApi'

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
      providesTags: ['Task']
    }),

    createTask: builder.mutation({
      query: ({ pageId, ...taskData }) => ({
        url: `/task/new/${pageId}`,
        method: 'POST',
        body: taskData
      }),
      invalidatesTags: ['Page']
    }),

    updateTaskBasic: builder.mutation({
      query: ({ pageId, taskId, ...updates }) => ({
        url: `/task/${pageId}/${taskId}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: ['Task', 'Page', 'Calendar']
    }),

    deleteTask: builder.mutation({
      query: ({ pageId, taskId }) => ({
        url: `/task/${pageId}/${taskId}`,
        method: 'DELETE'
      }),
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