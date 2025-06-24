import { v4 as uuid } from 'uuid'
import { api } from '../utils'
import {
   CREATE_PROGRESS,
   CONFIRM_CREATE_PROGRESS,
   DELETE_PROGRESS,
   PAGE_ERROR,
   UPDATE_PROGRESS
} from './types'

// Create new progress
export const createProgress = (reqData) => async (dispatch) => {
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
      payload: {
         progress_id: reqData.progress_id
      }
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
export const optimisticUpdateProgress = (updatedProgress, progress_order) => {
   const { title, title_color, color, progress_id } = updatedProgress
   const newProgressOrder = progress_order.map((p) =>
      p._id === progress_id
         ? {
              ...p,
              ...(title && { title }),
              ...(title_color && { title_color }),
              ...(color && { color })
           }
         : p
   )
   return { progress_order: newProgressOrder }
}
