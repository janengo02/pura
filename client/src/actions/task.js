import { api } from '../utils'
import { GET_PAGE, PAGE_ERROR, SHOW_TASK } from './types'

// Create new task
export const createTask = (formData) => async (dispatch) => {
   try {
      const res = await api.post(`/task/new/${formData.page_id}`, formData)
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

// Update a task
export const updateTask = (formData) => async (dispatch) => {
   try {
      const res = await api.post(
         `/task/update/${formData.page_id}/${formData.task_id}`,
         formData
      )
      dispatch({
         type: GET_PAGE,
         payload: res.data.page
      })
      if (formData.task_detail_flg) {
         dispatch({
            type: SHOW_TASK,
            payload: res.data.task
         })
      }
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
// Delete a task
export const deleteTask = (formData) => async (dispatch) => {
   try {
      const res = await api.delete(
         `/task/${formData.page_id}/${formData.task_id}`
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
// Show target task modal
export const showTaskModal = (formData) => async (dispatch) => {
   try {
      const res = await api.get(`/task/${formData.page_id}/${formData.task_id}`)
      dispatch({
         type: SHOW_TASK,
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
