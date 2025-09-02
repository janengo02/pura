import { api } from '../utils'
import {
   GET_PAGE,
   CREATE_TASK_SCHEDULE,
   SYNC_TASK_EVENT,
   DELETE_TASK_SCHEDULE
} from './types'
import { commonErrorHandler } from './errorActions'
import { taskApi } from '../api/taskApi'
import { calendarApi } from '../api/calendarApi'





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
