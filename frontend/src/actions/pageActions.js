import { api } from '../utils'
import { commonErrorHandler } from './errorActions'
import { DROP_TASK } from './types'


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
