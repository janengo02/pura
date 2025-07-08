import { api } from '../utils'
import {
   CLEAR_TASK,
   CREATE_TASK,
   DELETE_TASK,
   GET_PAGE,
   SHOW_TASK
} from './types'
import { pageActionErrorHandler } from './pageActions'

// Create new task
export const createTaskAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(`/task/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_TASK,
         payload: {
            ...reqData,
            newTask: res.data.task
         }
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, reqData.page_id, err)
   }
}

// Update a task
export const updateTaskAction = (formData) => async (dispatch) => {
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
      pageActionErrorHandler(dispatch, formData.page_id, err)
   }
}
// Delete a task
export const deleteTaskAction = (reqData) => async (dispatch) => {
   dispatch({
      type: DELETE_TASK,
      payload: {
         task_id: reqData.task_id
      }
   })
   try {
      await api.delete(`/task/${reqData.page_id}/${reqData.task_id}`)
   } catch (err) {
      pageActionErrorHandler(dispatch, reqData.page_id, err)
   }
}
// Show target task modal
export const showTaskModalAction = (formData) => async (dispatch) => {
   try {
      const res = await api.get(`/task/${formData.page_id}/${formData.task_id}`)
      dispatch({
         type: SHOW_TASK,
         payload: {
            ...res.data,
            ...(typeof formData.target_event_index === 'number' && {
               target_event_index: formData.target_event_index
            })
         }
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, formData.page_id, err)
   }
}
// Create new task
export const createTaskModalAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(`/task/new/${reqData.page_id}`, reqData)
      const res_task = await api.get(
         `/task/${reqData.page_id}/${res.data.task._id}`
      )
      dispatch({
         type: SHOW_TASK,
         payload: {
            ...res_task.data
         }
      })
      dispatch({
         type: CREATE_TASK,
         payload: {
            ...reqData,
            newTask: res.data.task
         }
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, reqData.page_id, err)
   }
}
export const clearTaskAction = () => (dispatch) => {
   dispatch({
      type: CLEAR_TASK,
      payload: null
   })
}
