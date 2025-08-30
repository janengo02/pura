import { api } from '../utils'
import { commonErrorHandler, fatalErrorHandler } from './errorActions'
import { FILTER_SCHEDULE, FILTER_NAME, DROP_TASK } from './types'


/**
 * Drop task to new position (drag and drop)
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {Object} reqData.result - Drag and drop result
 * @returns {Function} Redux thunk
 */
export const dropTaskAction = (reqData) => async (dispatch, getState) => {
   // Optimistic update - Page - update task position
   dispatch({
      type: DROP_TASK,
      payload: reqData.result
   })
   try {
      await api.post(`/page/move-task/${reqData.pageId}`, reqData)
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}
/**
 * Filter tasks by schedule
 * @param {Object} reqData - Filter criteria
 * @returns {Function} Redux thunk
 */
export const filterSchedule = (reqData) => async (dispatch) => {
   // Save reqData to cache (localStorage as an example)
   localStorage.setItem('filteredSchedule', JSON.stringify(reqData))
   dispatch({
      type: FILTER_SCHEDULE,
      payload: {
         schedule: reqData
      }
   })
}

/**
 * Filter tasks by name
 * @param {Object} reqData - Filter criteria
 * @returns {Function} Redux thunk
 */
export const filterName = (reqData) => async (dispatch) => {
   // Save reqData to cache (localStorage as an example)
   localStorage.setItem('filteredName', JSON.stringify(reqData))
   dispatch({
      type: FILTER_NAME,
      payload: {
         name: reqData
      }
   })
}
