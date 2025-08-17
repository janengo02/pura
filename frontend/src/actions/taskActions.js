import { api } from '../utils'
import {
   CLEAR_TASK,
   CREATE_TASK,
   DELETE_TASK,
   GET_PAGE,
   SHOW_TASK,
   MOVE_TASK,
   UPDATE_TASK_BASIC,
   UPDATE_TASK_SCHEDULE,
   CREATE_TASK_SCHEDULE,
   SYNC_TASK_EVENT,
   DELETE_TASK_SCHEDULE
} from './types'
import { commonErrorHandler, fatalErrorHandler } from './errorActions'
import { loadCalendarAction } from './calendarActions'

/**
 * Create new task
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.groupId - Group ID
 * @param {string} reqData.progressId - Progress ID
 * @param {string} [reqData.title] - Task title
 * @param {string} [reqData.content] - Task content
 * @returns {Function} Redux thunk
 */
export const createTaskAction = (reqData) => async (dispatch, getState) => {
   try {
      const res = await api.post(`/task/new/${reqData.pageId}`, reqData)
      dispatch({
         type: CREATE_TASK,
         payload: {
            ...reqData,
            newTask: res.data.task
         }
      })
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}

/**
 * Delete a task
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.taskId - Task ID
 * @returns {Function} Redux thunk
 */
export const deleteTaskAction = (reqData) => async (dispatch, getState) => {
   // Optimistic update - Page | Task | Calendar
   dispatch({
      type: DELETE_TASK,
      payload: {
         taskId: reqData.taskId
      }
   })
   try {
      await api.delete(`/task/${reqData.pageId}/${reqData.taskId}`)
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}
/**
 * Show task modal with task details
 * @param {Object} formData - Form data
 * @param {string} formData.pageId - Page ID
 * @param {string} formData.taskId - Task ID
 * @param {number} [formData.targetEventIndex] - Target event index
 * @returns {Function} Redux thunk
 */
export const showTaskModalAction = (formData) => async (dispatch) => {
   try {
      const res = await api.get(`/task/${formData.pageId}/${formData.taskId}`)
      dispatch({
         type: SHOW_TASK,
         payload: {
            ...res.data,
            ...(typeof formData.targetEventIndex === 'number' && {
               targetEventIndex: formData.targetEventIndex,
               viewTargetEventAt: new Date()
            })
         }
      })
   } catch (err) {
      fatalErrorHandler(dispatch, formData.pageId, err)
   }
}
/**
 * Create new task and show modal
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.groupId - Group ID
 * @param {string} reqData.progressId - Progress ID
 * @returns {Function} Redux thunk
 */
export const createTaskModalAction =
   (reqData) => async (dispatch, getState) => {
      try {
         const res = await api.post(`/task/new/${reqData.pageId}`, reqData)
         const res_task = await api.get(
            `/task/${reqData.pageId}/${res.data.task.id}`
         )
         dispatch({
            type: SHOW_TASK,
            payload: {
               ...res_task.data
            }
         })
         dispatch({
            type: CREATE_TASK,
            payload: {
               ...reqData,
               newTask: res.data.task
            }
         })
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Clear task modal state
 * @returns {Function} Redux thunk
 */
export const clearTaskAction = () => (dispatch) => {
   dispatch({
      type: CLEAR_TASK,
      payload: null
   })
}

/**
 * Create Google Event Action
 * Creates a new event in Google Calendar
 * @param {Object} reqData - Request data for event creation
 * @param {string} reqData.taskId - Task ID for the event
 * @param {Object} reqData.slotIndex - Index of the time slot in the task schedule.
 * @param {string} reqData.accountEmail - Google account email to use
 * @param {string} reqData.calendar_id - ID of the specific calendar to use
 */
export const syncTaskWithGoogleAction =
   (reqData) => async (dispatch, getState) => {
      try {
         const res = await api.post('/task/sync-google-event', reqData)

         // Update - Page | Task | Calendar
         dispatch({
            type: SYNC_TASK_EVENT,
            payload: {
               taskId: reqData.taskId,
               slotIndex: reqData.slotIndex,
               googleEventId: res.data.event.id,
               calendar_id: reqData.calendar_id,
               accountEmail: reqData.accountEmail,
               syncStatus: res.data.task.schedule[reqData.slotIndex].syncStatus,
               updateDate: res.data.task.updateDate,
               event: res.data.event,
               task: res.data.task
            }
         })
         // If getState is provided, handle calendar reload and task modal
         if (getState) {
            const state = getState()
            const calendarRange = state.calendar?.range
            const currentPageId = state.page?.id
            const currentTaskId = state.task?.task?.id

            // Reload calendar if range and page ID are available
            if (calendarRange && calendarRange.length > 0 && currentPageId) {
               dispatch(loadCalendarAction(calendarRange, currentPageId))
            }

            // Show task modal if both page ID and task ID are available
            if (currentPageId && currentTaskId) {
               dispatch(
                  showTaskModalAction({
                     pageId: currentPageId,
                     taskId: currentTaskId
                  })
               )
            }
         }
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Update task basic info (title, content)
 * @param {Object} formData - Form data
 * @param {string} formData.pageId - Page ID
 * @param {string} formData.taskId - Task ID
 * @param {string} [formData.title] - Task title
 * @param {string} [formData.content] - Task content
 * @returns {Function} Redux thunk
 */
export const updateTaskBasicInfoAction =
   (formData) => async (dispatch, getState) => {
      // Optimistic update - Page | Task | Calendar
      dispatch({
         type: UPDATE_TASK_BASIC,
         payload: {
            taskId: formData.taskId,
            title: formData.title,
            content: formData.content,
            updateDate: new Date().toISOString()
         }
      })

      try {
         await api.put(`/task/basic/${formData.pageId}/${formData.taskId}`, {
            title: formData.title,
            content: formData.content
         })
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Move task to different group/progress
 * @param {Object} formData - Form data
 * @param {string} formData.pageId - Page ID
 * @param {string} formData.taskId - Task ID
 * @param {Object} [formData.group] - Target group
 * @param {Object} [formData.progress] - Target progress
 * @returns {Function} Redux thunk
 */
export const moveTaskAction = (formData) => async (dispatch, getState) => {
   // Optimistic update - Task
   dispatch({
      type: MOVE_TASK,
      payload: {
         taskId: formData.taskId,
         group: formData.group,
         progress: formData.progress,
         updateDate: new Date().toISOString()
      }
   })

   try {
      const res = await api.put(
         `/task/move/${formData.pageId}/${formData.taskId}`,
         {
            groupId: formData.group?.id,
            progressId: formData.progress?.id
         }
      )
      dispatch({
         type: GET_PAGE,
         payload: res.data.page
      })
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}

/**
 * Update task schedule slot time
 * @param {Object} formData - Form data
 * @param {string} formData.pageId - Page ID
 * @param {string} formData.taskId - Task ID
 * @param {number} formData.slotIndex - Slot index
 * @param {string} formData.start - Start time
 * @param {string} formData.end - End time
 * @returns {Function} Redux thunk
 */
export const updateTaskScheduleAction =
   (formData) => async (dispatch, getState) => {
      // Optimistic update - Page | Task | Calendar
      dispatch({
         type: UPDATE_TASK_SCHEDULE,
         payload: {
            ...formData,
            updateDate: new Date().toISOString()
         }
      })
      try {
         await api.put(
            `/task/schedule/${formData.pageId}/${formData.taskId}/${formData.slotIndex}`,
            {
               start: formData.start,
               end: formData.end
            }
         )
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Add new schedule slot to task
 * @param {Object} formData - Form data
 * @param {string} formData.pageId - Page ID
 * @param {string} formData.taskId - Task ID
 * @param {string} formData.start - Start time
 * @param {string} formData.end - End time
 * @returns {Function} Redux thunk that returns {newSlotIndex}
 */
export const addTaskScheduleSlotAction =
   (formData) => async (dispatch, getState) => {
      try {
         const newSlot = {
            start: formData.start,
            end: formData.end,
            googleEventId: null,
            googleCalendarId: null,
            googleAccountEmail: null,
            syncStatus: '0'
         }
         const newSlotIndex = formData.slotIndex

         // Optimistic update - Page | Task
         dispatch({
            type: CREATE_TASK_SCHEDULE,
            payload: {
               taskId: formData.taskId,
               taskTitle: formData.task_title,
               taskContent: formData.task_content,
               newSlot: newSlot,
               newSlotIndex: newSlotIndex,
               updateDate: new Date().toISOString()
            }
         })

         await api.post(
            `/task/schedule/${formData.pageId}/${formData.taskId}`,
            {
               start: formData.start,
               end: formData.end
            }
         )
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }

/**
 * Remove schedule slot from task
 * @param {Object} formData - Form data
 * @param {string} formData.pageId - Page ID
 * @param {string} formData.taskId - Task ID
 * @param {number} formData.slotIndex - Slot index
 * @returns {Function} Redux thunk
 */
export const removeTaskScheduleSlotAction =
   (formData) => async (dispatch, getState) => {
      // Optimistic update - Page | Task | Calendar
      dispatch({
         type: DELETE_TASK_SCHEDULE,
         payload: {
            taskId: formData.taskId,
            slotIndex: formData.slotIndex,
            updateDate: new Date().toISOString()
         }
      })

      try {
         await api.delete(
            `/task/schedule/${formData.pageId}/${formData.taskId}/${formData.slotIndex}`
         )
      } catch (err) {
         commonErrorHandler(dispatch, err, getState)
      }
   }
