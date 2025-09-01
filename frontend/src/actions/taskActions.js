import { api } from '../utils'
import {
   GET_PAGE,
   UPDATE_TASK_BASIC,
   UPDATE_TASK_SCHEDULE,
   CREATE_TASK_SCHEDULE,
   SYNC_TASK_EVENT,
   DELETE_TASK_SCHEDULE
} from './types'
import { commonErrorHandler } from './errorActions'
import { taskApi } from '../api/taskApi'
import { calendarApi } from '../api/calendarApi'


/**
 * Create Google Event Action
 * Creates a new event in Google Calendar
 * @param {Object} reqData - Request data for event creation
 * @param {string} reqData.taskId - Task ID for the event
 * @param {Object} reqData.slotIndex - Index of the time slot in the task schedule.
 * @param {string} reqData.accountEmail - Google account email to use
 * @param {string} reqData.calendarId - ID of the specific calendar to use
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
               calendarId: reqData.calendarId,
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
            const calendarRange = state.calendarSlice?.range
            const currentPageId = state.pageSlice?.id
            const currentTaskId = state.taskSlice?.task?.id

            // Reload calendar if range and page ID are available
            if (calendarRange && calendarRange.length > 0 && currentPageId) {
               dispatch(calendarApi.endpoints.loadCalendar.initiate({
                  minDate: calendarRange[0],
                  maxDate: calendarRange[1],
                  pageId: currentPageId
               }))
            }

            // Show task modal if both page ID and task ID are available
            if (currentPageId && currentTaskId) {
               dispatch(taskApi.endpoints.showTaskModal.initiate({
                  pageId: currentPageId,
                  taskId: currentTaskId
               }))
            }
         }
      } catch (err) {
         commonErrorHandler(dispatch, err)
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
         commonErrorHandler(dispatch, err)
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
         commonErrorHandler(dispatch, err)
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
         commonErrorHandler(dispatch, err)
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
         commonErrorHandler(dispatch, err)
      }
   }
