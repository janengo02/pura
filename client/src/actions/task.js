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
   dispatch({
      type: SHOW_TASK,
      payload: formData
   })
}
// Update Progress
export const updateProgress =
   (state, task, newProgress) => async (dispatch) => {
      const i_group = task.i_group
      const i_progress = task.i_progress
      const i_new_progress = state.progress_order.indexOf(newProgress)
      const i_task_map = i_group * state.progress_order.length + i_progress
      const i_new_task_map =
         i_group * state.progress_order.length + i_new_progress
      const dest_index =
         state.task_map[i_new_task_map] - state.task_map[i_new_task_map - 1]
      const source = {
         droppableId: i_task_map.toString()
      }
      const destination = {
         droppableId: i_new_task_map.toString(),
         index: dest_index
      }
      const formData = {
         page_id: state._id,
         destination: destination,
         source: source,
         draggableId: task.draggableId
      }
      const newTask = {
         ...task,
         i_progress: i_new_progress
      }
      try {
         const res = await api.post(
            `/page/move-task/${formData.page_id}`,
            formData
         )
         dispatch({
            type: GET_PAGE,
            payload: res.data
         })
         dispatch({
            type: SHOW_TASK,
            payload: newTask
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
// Update Group
export const updateGroup = (state, task, newGroup) => async (dispatch) => {
   const i_group = task.i_group
   const i_progress = task.i_progress
   const i_new_group = state.group_order.indexOf(newGroup)
   const i_task_map = i_group * state.progress_order.length + i_progress
   const i_new_task_map = i_new_group * state.progress_order.length + i_progress
   const dest_index =
      state.task_map[i_new_task_map] - state.task_map[i_new_task_map - 1]
   const source = {
      droppableId: i_task_map.toString()
   }
   const destination = {
      droppableId: i_new_task_map.toString(),
      index: dest_index
   }
   const formData = {
      page_id: state._id,
      destination: destination,
      source: source,
      draggableId: task.draggableId
   }
   const newTask = {
      ...task,
      i_group: i_new_group
   }
   try {
      const res = await api.post(
         `/page/move-task/${formData.page_id}`,
         formData
      )
      dispatch({
         type: GET_PAGE,
         payload: res.data
      })
      dispatch({
         type: SHOW_TASK,
         payload: newTask
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
