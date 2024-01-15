import { api } from '../utils'
import { GET_PAGE, PAGE_ERROR } from './types'

// Create new progress
export const createProgress = (formData) => async (dispatch) => {
   console.log(formData)
   try {
      const res = await api.post(`/progress/new/${formData.page_id}`, formData)
      dispatch({
         type: GET_PAGE,
         payload: res.data
      })
   } catch (err) {
      const errors = err.response.data.errors

      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: formData.page_id,
            errors: errors
         }
      })
      // console.clear()
   }
}

// Update a group
export const updateProgress = (formData) => async (dispatch) => {
   try {
      const res = await api.post(
         `/progress/update/${formData.page_id}/${formData.progress_id}`,
         formData
      )
      dispatch({
         type: GET_PAGE,
         payload: res.data
      })
   } catch (err) {
      const errors = err.response.data.errors
      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: formData.page_id,
            errors: errors
         }
      })
      // console.clear()
   }
}
