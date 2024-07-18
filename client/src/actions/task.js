import { v4 as uuid } from 'uuid'
import { api } from '../utils'
import {
   CREATE_TASK,
   DELETE_TASK,
   GET_PAGE,
   GOOGLE_CALENDAR_SYNCED_EVENT_LOADING,
   GOOGLE_CALENDAR_UPDATE_EVENT,
   PAGE_ERROR,
   SHOW_TASK
} from './types'
import cloneDeep from 'clone-deep'

// Create new task
export const createTask = (reqData) => async (dispatch) => {
   dispatch({
      type: CREATE_TASK,
      payload: {
         ...reqData,
         task_id: 'new'
      }
   })
   try {
      const res = await api.post(`/task/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_TASK,
         payload: res.data
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
   if (typeof formData.synced_g_event === 'string') {
      dispatch({
         type: GOOGLE_CALENDAR_SYNCED_EVENT_LOADING,
         payload: { synced_g_event: formData.synced_g_event }
      })
   }
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
      if (typeof formData.synced_g_event === 'string') {
         dispatch({
            type: GOOGLE_CALENDAR_UPDATE_EVENT,
            payload: res.data.event
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
      payload: reqData.task_id
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
            ...(typeof formData.target_g_event_index === 'number' && {
               target_g_event_index: formData.target_g_event_index
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
export const optimisticAddTask = (
   new_task_info,
   group_order,
   progress_order,
   task_map,
   tasks
) => {
   const { task_id, group_id, progress_id } = new_task_info
   if (task_id === 'new') {
      const newTask = {
         _id: uuid(),
         title: '',
         schedule: [],
         google_events: [],
         content: '',
         isNew: true
      }
      const progressIndex = progress_order.findIndex(
         (p) => p._id === progress_id
      )
      const groupIndex = group_order.findIndex((g) => g._id === group_id)
      const taskMapIndex = groupIndex * progress_order.length + progressIndex
      const newTaskMap = cloneDeep(task_map)
      for (let i = taskMapIndex; i < newTaskMap.length; i++) {
         newTaskMap[i]++
      }
      const newTasks = cloneDeep(tasks)
      newTasks.splice(newTaskMap[taskMapIndex] - 1, 0, newTask)
      return {
         tasks: newTasks,
         task_map: newTaskMap
      }
   } else {
      const newTasks = tasks.map((t) =>
         t.isNew
            ? {
                 ...t,
                 _id: task_id,
                 isNew: false
              }
            : t
      )
      return { tasks: newTasks }
   }
}

export const optimisticDeleteTask = (task_id, task_map, tasks) => {
   const newTasks = cloneDeep(tasks)
   const taskIndex = newTasks.findIndex((t) => t._id === task_id)
   newTasks.splice(taskIndex, 1)

   //   Prepare: Set up new task_map
   var newTaskMap = cloneDeep(task_map)
   for (let i = 0; i < newTaskMap.length; i++) {
      if (newTaskMap[i] > taskIndex) newTaskMap[i]--
   }
   return { tasks: newTasks, task_map: newTaskMap }
}
