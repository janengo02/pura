import { baseApi } from './baseApi'

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTask: builder.query({
      query: ({ pageId, taskId }) => `/task/${pageId}/${taskId}`,
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
    
    moveTask: builder.mutation({
      query: ({ pageId, taskId, groupId, progressId }) => ({
        url: `/task/move/${pageId}/${taskId}`,
        method: 'PATCH',
        body: { groupId, progressId }
      }),
      invalidatesTags: ['Task', 'Page']
    }),
    
    // Task Schedule Management
    createTaskSchedule: builder.mutation({
      query: ({ pageId, taskId, scheduleData }) => ({
        url: `/task/schedule/${pageId}/${taskId}`,
        method: 'POST',
        body: scheduleData
      }),
      invalidatesTags: ['Task', 'Calendar']
    }),
    
    updateTaskSchedule: builder.mutation({
      query: ({ pageId, taskId, slotIndex, ...updates }) => ({
        url: `/task/schedule/${pageId}/${taskId}/${slotIndex}`,
        method: 'PATCH',
        body: updates
      }),
      invalidatesTags: ['Task', 'Calendar']
    }),
    
    deleteTaskSchedule: builder.mutation({
      query: ({ pageId, taskId, slotIndex }) => ({
        url: `/task/schedule/${pageId}/${taskId}/${slotIndex}`,
        method: 'DELETE'
      }),
      invalidatesTags: ['Task', 'Calendar']
    }),
    
    syncTaskEvent: builder.mutation({
      query: ({ pageId, taskId, slotIndex, googleEventId, calendarId, accountEmail }) => ({
        url: `/task/sync/${pageId}/${taskId}/${slotIndex}`,
        method: 'PATCH',
        body: { googleEventId, calendarId, accountEmail }
      }),
      invalidatesTags: ['Task', 'Calendar']
    })
  })
})

export const {
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskBasicMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useCreateTaskScheduleMutation,
  useUpdateTaskScheduleMutation,
  useDeleteTaskScheduleMutation,
  useSyncTaskEventMutation
} = taskApi