import { api } from '../utils'
import { CREATE_GROUP, DELETE_GROUP, UPDATE_GROUP } from './types'

import { commonErrorHandler } from './errorActions'

/**
 * Delete a group
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.groupId - Group ID
 * @returns {Function} Redux thunk
 */
export const deleteGroupAction = (reqData) => async (dispatch, getState) => {
   // Optimistic update - Group - remove group from state
   dispatch({
      type: DELETE_GROUP,
      payload: {
         groupId: reqData.groupId
      }
   })
   // @todo: Update calendar events or reload calendar

   try {
      await api.delete(`/group/${reqData.pageId}/${reqData.groupId}`)
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}
