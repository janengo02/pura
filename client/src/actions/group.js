import { api } from '../utils'
import { GET_PAGE, PAGE_ERROR } from './types'

// Create new group
export const createGroup = (formData) => async (dispatch) => {
   try {
      const res = await api.post(`/group/new/${formData.page_id}`, formData)
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
export const updateGroup = (formData) => async (dispatch) => {
   try {
      const res = await api.post(
         `/group/update/${formData.page_id}/${formData.group_id}`,
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

// Delete a group
export const deleteGroup = (formData) => async (dispatch) => {
   try {
      const res = await api.delete(
         `/group/${formData.page_id}/${formData.group_id}`
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
