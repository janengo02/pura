import { baseApi } from './baseApi'
import { commonErrorHandler } from '../actions/errorActions'
import { optimisticDeleteTask as taskSliceOptimisticDeleteTask, optimisticAddScheduleSlot as taskSliceOptimisticAddScheduleSlot } from '../reducers/taskSlice'
import { optimisticDeleteTask as pageSliceOptimisticDeleteTask, optimisticAddScheduleSlot as pageSliceOptimisticAddScheduleSlot } from '../reducers/pageSlice'
import { optimisticDeleteTask as calendarSliceOptimisticDeleteTask, optimisticAddScheduleSlot as calendarSliceOptimisticAddScheduleSlot } from '../reducers/calendarSlice'
import { optimisticMoveTask as taskSliceOptimisticMoveTask } from '../reducers/taskSlice'

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
        url: `/task/basic/${pageId}/${taskId}`,
        method: 'PUT',
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
        // Perform optimistic updates immediately
        dispatch(taskSliceOptimisticDeleteTask({ taskId: arg.taskId }))
        dispatch(pageSliceOptimisticDeleteTask({ taskId: arg.taskId }))
        dispatch(calendarSliceOptimisticDeleteTask({ taskId: arg.taskId }))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Task', 'Page', 'Calendar']
    }),

    moveTask: builder.mutation({
      query: ({ pageId, taskId, groupId, progressId }) => ({
        url: `/task/move/${pageId}/${taskId}`,
        method: 'PUT',
        body: {
          groupId,
          progressId
        }
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {

        // Perform optimistic updates immediately
        dispatch(taskSliceOptimisticMoveTask({
          taskId: arg.taskId,
          group: arg.group,
          progress: arg.progress,
          updateDate: new Date().toISOString()
        }))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Task', 'Page']
    }),

    addTaskScheduleSlot: builder.mutation({
      query: ({ pageId, taskId, start, end }) => ({
        url: `/task/schedule/${pageId}/${taskId}`,
        method: 'POST',
        body: {
          start,
          end
        }
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        const optimisticPayload = {
          taskId: arg.taskId,
          taskTitle: arg.taskTitle,
          taskContent: arg.taskContent,
          newSlot: {
            start: arg.start,
            end: arg.end,
            googleEventId: null,
            googleCalendarId: null,
            googleAccountEmail: null,
            syncStatus: '0'
          },
          newSlotIndex: arg.slotIndex,
          updateDate: new Date().toISOString()
        }

        // Perform optimistic updates immediately
        dispatch(taskSliceOptimisticAddScheduleSlot(optimisticPayload))
        dispatch(pageSliceOptimisticAddScheduleSlot(optimisticPayload))
        dispatch(calendarSliceOptimisticAddScheduleSlot(optimisticPayload))

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
  useMoveTaskMutation,
  useAddTaskScheduleSlotMutation,
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