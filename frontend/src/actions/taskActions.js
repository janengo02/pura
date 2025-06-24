import { v4 as uuid } from 'uuid'
import { api } from '../utils'
import {
   CREATE_TASK,
   CONFIRM_CREATE_TASK,
   DELETE_TASK,
   GET_PAGE,
   PAGE_ERROR,
   SHOW_TASK
} from './types'

// Create new task
export const createTask = (reqData) => async (dispatch) => {
   const tempTaskId = uuid()
   const optimisticTask = {
      _id: tempTaskId,
      title: '',
      schedule: [],
      content: ''
   }
   dispatch({
      type: CREATE_TASK,
      payload: {
         ...reqData,
         newTask: optimisticTask
      }
   })
   try {
      const res = await api.post(`/task/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CONFIRM_CREATE_TASK,
         payload: {
            temp_task_id: tempTaskId,
            task_id: res.data.task_id
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
export const deleteTask = (reqData) => async (dispatch) => {
   dispatch({
      type: DELETE_TASK,
      payload: {
         task_id: reqData.task_id
      }
   })
   try {
      await api.delete(`/task/${reqData.page_id}/${reqData.task_id}`)
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
// Show target task modal
export const showTaskModal = (formData) => async (dispatch) => {
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
