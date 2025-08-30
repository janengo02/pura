import { api } from '../utils'
import { CREATE_PROGRESS, DELETE_PROGRESS, UPDATE_PROGRESS } from './types'
import { commonErrorHandler } from './errorActions'

/**
 * Create new progress status
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.title - Progress title
 * @param {string} reqData.titleColor - Progress title color
 * @param {string} reqData.color - Progress background color
 * @returns {Function} Redux thunk
 */
export const createProgressAction = (reqData) => async (dispatch, getState) => {
   try {
      const res = await api.post(`/progress/new/${reqData.pageId}`, reqData)
      dispatch({
         type: CREATE_PROGRESS,
         payload: res.data.progress
      })
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}

/**
 * Update a progress status
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.progressId - Progress ID
 * @param {string} [reqData.title] - Progress title
 * @param {string} [reqData.titleColor] - Progress title color
 * @param {string} [reqData.color] - Progress background color
 * @returns {Function} Redux thunk
 */
export const updateProgressAction = (reqData) => async (dispatch, getState) => {
   // Optimistic update - Progress - update progress details in state
   dispatch({
      type: UPDATE_PROGRESS,
      payload: reqData
   })
   try {
      await api.post(
         `/progress/update/${reqData.pageId}/${reqData.progressId}`,
         reqData
      )
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}

/**
 * Delete a progress status
 * @param {Object} reqData - Request data
 * @param {string} reqData.pageId - Page ID
 * @param {string} reqData.progressId - Progress ID
 * @returns {Function} Redux thunk
 */
export const deleteProgressAction = (reqData) => async (dispatch, getState) => {
   // Optimistic update - Progress - remove progress from state
   dispatch({
      type: DELETE_PROGRESS,
      payload: {
         progressId: reqData.progressId
      }
   })
   // @todo: Update calendar events or reload calendar
   try {
      await api.delete(`/progress/${reqData.pageId}/${reqData.progressId}`)
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}
