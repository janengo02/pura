import { api } from '../utils'
import {
   GET_PAGE,
   UPDATE_TASK_SCHEDULE,
   CREATE_TASK_SCHEDULE,
   SYNC_TASK_EVENT,
   DELETE_TASK_SCHEDULE
} from './types'
import { commonErrorHandler } from './errorActions'
import { taskApi } from '../api/taskApi'
import { calendarApi } from '../api/calendarApi'





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
