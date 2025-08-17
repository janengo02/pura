import { api } from '../utils'
import { CREATE_GROUP, DELETE_GROUP, UPDATE_GROUP } from './types'

import { commonErrorHandler } from './errorActions'

/**
 * Create new group
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.title - Group title
 * @param {string} reqData.color - Group color
 * @returns {Function} Redux thunk
 */
export const createGroupAction = (reqData) => async (dispatch, getState) => {
   try {
      const res = await api.post(`/group/new/${reqData.pageId}`, reqData)
      dispatch({
         type: CREATE_GROUP,
         payload: res.data.group
      })
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}

/**
 * Update a group
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.groupId - Group ID
 * @param {string} [reqData.title] - Group title
 * @param {string} [reqData.color] - Group color
 * @returns {Function} Redux thunk
 */
export const updateGroupAction = (reqData) => async (dispatch, getState) => {
   // Optimistic update - Group - update group details in state
   dispatch({
      type: UPDATE_GROUP,
      payload: reqData
   })
   try {
      await api.post(
         `/group/update/${reqData.pageId}/${reqData.groupId}`,
         reqData
      )
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}

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
   try {
      await api.delete(`/group/${reqData.pageId}/${reqData.groupId}`)
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}
