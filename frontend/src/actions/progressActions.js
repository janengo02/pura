import { api } from '../utils'
import { CREATE_PROGRESS, DELETE_PROGRESS, UPDATE_PROGRESS } from './types'
import { commonErrorHandler } from './errorActions'

/**
 * Create new progress status
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.title - Progress title
 * @param {string} reqData.title_color - Progress title color
 * @param {string} reqData.color - Progress background color
 * @returns {Function} Redux thunk
 */
export const createProgressAction = (reqData) => async (dispatch, getState) => {
   try {
      const res = await api.post(`/progress/new/${reqData.page_id}`, reqData)
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
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.progress_id - Progress ID
 * @param {string} [reqData.title] - Progress title
 * @param {string} [reqData.title_color] - Progress title color
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
         `/progress/update/${reqData.page_id}/${reqData.progress_id}`,
         reqData
      )
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}

/**
 * Delete a progress status
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.progress_id - Progress ID
 * @returns {Function} Redux thunk
 */
export const deleteProgressAction = (reqData) => async (dispatch, getState) => {
   // Optimistic update - Progress - remove progress from state
   dispatch({
      type: DELETE_PROGRESS,
      payload: {
         progress_id: reqData.progress_id
      }
   })
   try {
      await api.delete(`/progress/${reqData.page_id}/${reqData.progress_id}`)
   } catch (err) {
      commonErrorHandler(dispatch, err, getState)
   }
}
