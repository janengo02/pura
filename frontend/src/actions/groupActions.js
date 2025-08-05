import { api } from '../utils'
import { CREATE_GROUP, DELETE_GROUP, UPDATE_GROUP } from './types'

import { pageActionErrorHandler } from './pageActions'

/**
 * Create new group
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.title - Group title
 * @param {string} reqData.color - Group color
 * @returns {Function} Redux thunk
 */
export const createGroupAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(`/group/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_GROUP,
         payload: res.data.group
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}

/**
 * Update a group
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.group_id - Group ID
 * @param {string} [reqData.title] - Group title
 * @param {string} [reqData.color] - Group color
 * @returns {Function} Redux thunk
 */
export const updateGroupAction = (reqData) => async (dispatch) => {
   // Optimistic update - Group - update group details in state
   dispatch({
      type: UPDATE_GROUP,
      payload: reqData
   })
   try {
      await api.post(
         `/group/update/${reqData.page_id}/${reqData.group_id}`,
         reqData
      )
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}

/**
 * Delete a group
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.group_id - Group ID
 * @returns {Function} Redux thunk
 */
export const deleteGroupAction = (reqData) => async (dispatch) => {
   // Optimistic update - Group - remove group from state
   dispatch({
      type: DELETE_GROUP,
      payload: {
         group_id: reqData.group_id
      }
   })
   try {
      await api.delete(`/group/${reqData.page_id}/${reqData.group_id}`)
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}
