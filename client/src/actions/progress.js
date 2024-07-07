import cloneDeep from 'clone-deep'
import { api } from '../utils'
import {
   CREATE_PROGRESS,
   DELETE_PROGRESS,
   PAGE_ERROR,
   UPDATE_PROGRESS
} from './types'

// Create new progress
export const createProgress = (reqData) => async (dispatch) => {
   dispatch({
      type: CREATE_PROGRESS,
      payload: 'new'
   })
   try {
      const res = await api.post(`/progress/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_PROGRESS,
         payload: res.data.progress_id
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
      payload: reqData.progress_id
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
export const optimisticCreateProgress = (
   progress_id,
   progress_order,
   group_order,
   task_map
) => {
   if (progress_id === 'new') {
      const newProgress = {
         _id: 'new',
         title: '',
         title_color: '#4A5568',
         color: '#EDF2F7',
         visibility: true
      }
      var newTaskMap = cloneDeep(task_map)
      if (group_order.length > 0) {
         const n_group = group_order.length
         const m_progress = progress_order.length + 1
         for (let i = 1; i <= n_group; i++) {
            const task_count = newTaskMap[i * m_progress - 2]
            newTaskMap.splice(i * m_progress - 1, 0, task_count)
         }
      }
      const newProgressOrder = cloneDeep(progress_order)
      newProgressOrder.push(newProgress)
      return { progress_order: newProgressOrder, task_map: newTaskMap }
   } else {
      const newProgressOrder = progress_order.map((p) =>
         p._id === 'new'
            ? {
                 ...p,
                 _id: progress_id
              }
            : p
      )
      return { progress_order: newProgressOrder }
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
export const optimisticDeleteProgress = (
   progress_id,
   progress_order,
   group_order,
   tasks,
   task_map
) => {
   const oldTasks = cloneDeep(tasks)
   const newTasks = []
   const oldTaskMap = cloneDeep(task_map)
   const newTaskMap = []
   const progressIndex = progress_order.findIndex((p) => p._id === progress_id)
   const groupCount = group_order.length
   const progressCount = progress_order.length

   let deletedCount = 0
   for (let i = 0; i < groupCount; i++) {
      for (let j = 0; j < progressCount; j++) {
         const currentMap = i * progressCount + j
         const currentMapCount = oldTaskMap[currentMap]
         let prevMapCount = 0
         if (currentMap !== 0) {
            prevMapCount = oldTaskMap[currentMap - 1]
         }
         if (j === progressIndex) {
            deletedCount += currentMapCount - prevMapCount
         } else {
            const newMapCount = currentMapCount - deletedCount
            newTaskMap.push(newMapCount)
            for (let t = prevMapCount; t < currentMapCount; t++) {
               newTasks.push(oldTasks[t])
            }
         }
      }
   }
   const newProgressOrder = cloneDeep(progress_order)
   newProgressOrder.splice(progressIndex, 1)
   return {
      progress_order: newProgressOrder,
      tasks: newTasks,
      task_map: newTaskMap
   }
}
