import { api } from '../utils'
import { CREATE_PROGRESS, DELETE_PROGRESS, UPDATE_PROGRESS } from './types'
import { pageActionErrorHandler } from './pageActions'

// Create new progress
export const createProgressAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(`/progress/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_PROGRESS,
         payload: res.data.progress
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}

// Update a group
export const updateProgressAction = (reqData) => async (dispatch) => {
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
      pageActionErrorHandler(dispatch, err)
   }
}

// Delete a progress
export const deleteProgressAction = (reqData) => async (dispatch) => {
   dispatch({
      type: DELETE_PROGRESS,
      payload: {
         progress_id: reqData.progress_id
      }
   })
   try {
      await api.delete(`/progress/${reqData.page_id}/${reqData.progress_id}`)
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}
