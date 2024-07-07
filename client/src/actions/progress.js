import { api } from '../utils'
import {
   CREATE_PROGRESS,
   DELETE_PROGRESS,
   PAGE_ERROR,
   UPDATE_PROGRESS
} from './types'

// Create new progress
export const createProgress = (reqData) => async (dispatch) => {
   dispatch({
      type: CREATE_PROGRESS,
      payload: 'new'
   })
   try {
      const res = await api.post(`/progress/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_PROGRESS,
         payload: res.data.progress_id
      })
   } catch (err) {
      const errors = err.response.data.errors

      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: reqData.page_id,
            errors: errors
         }
      })
      // console.clear()
   }
}

// Update a group
export const updateProgress = (reqData) => async (dispatch) => {
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
      const errors = err.response.data.errors
      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: reqData.page_id,
            errors: errors
         }
      })
      // Todo: revert action
      // console.clear()
   }
}

// Delete a progress
export const deleteProgress = (reqData) => async (dispatch) => {
   dispatch({
      type: DELETE_PROGRESS,
      payload: reqData.progress_id
   })
   try {
      await api.delete(`/progress/${reqData.page_id}/${reqData.progress_id}`)
   } catch (err) {
      const errors = err.response.data.errors
      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: reqData.page_id,
            errors: errors
         }
      })
      // console.clear()
   }
}
