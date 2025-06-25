import { v4 as uuid } from 'uuid'
import { api } from '../utils'
import {
   CREATE_PROGRESS,
   CONFIRM_CREATE_PROGRESS,
   DELETE_PROGRESS,
   UPDATE_PROGRESS
} from './types'
import { pageActionErrorHandler } from './pageActions'

// Create new progress
export const createProgressAction = (reqData) => async (dispatch) => {
   const tempProgressId = uuid()
   const optimisticProgress = {
      _id: tempProgressId,
      title: '',
      title_color: '#4A5568',
      color: '#EDF2F7',
      visibility: true
   }
   dispatch({
      type: CREATE_PROGRESS,
      payload: optimisticProgress
   })

   try {
      const res = await api.post(`/progress/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CONFIRM_CREATE_PROGRESS,
         payload: {
            temp_progress_id: tempProgressId,
            progress_id: res.data.progress_id
         }
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, reqData.page_id, err)
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
      pageActionErrorHandler(dispatch, reqData.page_id, err)
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
      pageActionErrorHandler(dispatch, reqData.page_id, err)
   }
}
