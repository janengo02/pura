import { baseApi } from '../../../shared/api/baseApi'
import { commonErrorHandler } from '../../error/errorHandlerHelpers'
import { optimisticDeleteTask as taskSliceOptimisticDeleteTask, optimisticAddScheduleSlot as taskSliceOptimisticAddScheduleSlot, optimisticUpdateTaskBasic as taskSliceOptimisticUpdateTaskBasic, optimisticUpdateTaskSchedule as taskSliceOptimisticUpdateTaskSchedule, optimisticRemoveTaskScheduleSlot as taskSliceOptimisticRemoveTaskScheduleSlot } from '../taskSlice'
import { optimisticDeleteTask as pageSliceOptimisticDeleteTask, optimisticAddScheduleSlot as pageSliceOptimisticAddScheduleSlot, optimisticUpdateTaskBasic as pageSliceOptimisticUpdateTaskBasic, optimisticUpdateTaskSchedule as pageSliceOptimisticUpdateTaskSchedule, optimisticRemoveTaskScheduleSlot as pageSliceOptimisticRemoveTaskScheduleSlot } from '../../kanban/pageSlice'
import { optimisticDeleteTask as calendarSliceOptimisticDeleteTask, optimisticAddScheduleSlot as calendarSliceOptimisticAddScheduleSlot, optimisticUpdateTaskBasic as calendarSliceOptimisticUpdateTaskBasic, optimisticUpdateTaskSchedule as calendarSliceOptimisticUpdateTaskSchedule, optimisticRemoveTaskScheduleSlot as calendarSliceOptimisticRemoveTaskScheduleSlot } from '../../calendar/calendarSlice'
import { optimisticMoveTask as taskSliceOptimisticMoveTask } from '../taskSlice'

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
      invalidatesTags: []
    }),

    updateTaskBasic: builder.mutation({
      query: ({ pageId, taskId, ...updates }) => ({
        url: `/task/basic/${pageId}/${taskId}`,
        method: 'PUT',
        body: updates
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Create optimistic payload
        const optimisticPayload = {
          taskId: arg.taskId,
          title: arg.title,
          content: arg.content,
          updateDate: new Date().toISOString()
        }

        // Perform optimistic updates immediately
        dispatch(taskSliceOptimisticUpdateTaskBasic(optimisticPayload))
        dispatch(pageSliceOptimisticUpdateTaskBasic(optimisticPayload))
        dispatch(calendarSliceOptimisticUpdateTaskBasic(optimisticPayload))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: []
    }),

    updateTaskSchedule: builder.mutation({
      query: ({ pageId, taskId, slotIndex, start, end }) => ({
        url: `/task/schedule/${pageId}/${taskId}/${slotIndex}`,
        method: 'PUT',
        body: {
          start,
          end
        }
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Create optimistic payload
        const optimisticPayload = {
          taskId: arg.taskId,
          slotIndex: arg.slotIndex,
          start: arg.start,
          end: arg.end,
          updateDate: new Date().toISOString(),
          ...(typeof arg.targetEventIndex === 'number' && { targetEventIndex: arg.targetEventIndex }),
          ...(arg.viewTargetEventAt && { viewTargetEventAt: arg.viewTargetEventAt })
        }

        // Perform optimistic updates immediately
        dispatch(taskSliceOptimisticUpdateTaskSchedule(optimisticPayload))
        dispatch(pageSliceOptimisticUpdateTaskSchedule(optimisticPayload))
        dispatch(calendarSliceOptimisticUpdateTaskSchedule(optimisticPayload))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: []
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
      invalidatesTags: []
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
      invalidatesTags: ['Page']
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
      invalidatesTags: []
    }),

    removeTaskScheduleSlot: builder.mutation({
      query: ({ pageId, taskId, slotIndex }) => ({
        url: `/task/schedule/${pageId}/${taskId}/${slotIndex}`,
        method: 'DELETE'
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Create optimistic payload
        const optimisticPayload = {
          taskId: arg.taskId,
          slotIndex: arg.slotIndex,
          updateDate: new Date().toISOString()
        }

        // Perform optimistic updates immediately
        dispatch(taskSliceOptimisticRemoveTaskScheduleSlot(optimisticPayload))
        dispatch(pageSliceOptimisticRemoveTaskScheduleSlot(optimisticPayload))
        dispatch(calendarSliceOptimisticRemoveTaskScheduleSlot(optimisticPayload))

        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: []
    }),

    syncTaskWithGoogle: builder.mutation({
      query: (reqData) => ({
        url: '/task/sync-google-event',
        method: 'POST',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled
        } catch (err) {
          // Handle error using common error handler
          commonErrorHandler(dispatch, err)
        }
      },
      invalidatesTags: ['Page', 'Calendar']
    }),

  })
})

export const {
  useShowTaskModalMutation,
  useCreateTaskMutation,
  useUpdateTaskBasicMutation,
  useUpdateTaskScheduleMutation,
  useDeleteTaskMutation,
  useMoveTaskMutation,
  useAddTaskScheduleSlotMutation,
  useRemoveTaskScheduleSlotMutation,
  useSyncTaskWithGoogleMutation,
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