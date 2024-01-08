import { api } from '../utils'
import { GET_PAGE, PAGE_ERROR } from './types'
import { setAlert } from './alert'

// Create new task
export const createTask = (formData) => async (dispatch) => {
   try {
      const res = await api.post(`/task/new/${formData.page_id}`, formData)
      dispatch({
         type: GET_PAGE,
         payload: res.data
      })
   } catch (err) {
      console.log(err)
      // TODO: Handle errors
      const errors = err.response.data.errors
      if (errors) {
         errors.forEach((error) =>
            dispatch(setAlert(error.title, error.msg, 'error'))
         )
      }
      dispatch({
         type: PAGE_ERROR,
         payload: { msg: err.response }
      })
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
         payload: res.data
      })
   } catch (err) {
      console.log(err)
      // TODO: Handle errors
      const errors = err.response.data.errors
      if (errors) {
         errors.forEach((error) =>
            dispatch(setAlert(error.title, error.msg, 'error'))
         )
      }
      dispatch({
         type: PAGE_ERROR,
         payload: { msg: err.response }
      })
   }
}
