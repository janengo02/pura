import cloneDeep from 'clone-deep'
import { api } from '../utils'
import { GET_PAGE, MOVE_TASK, PAGE_ERROR } from './types'

// Get the first page of a user
export const getFirstPage = () => async (dispatch) => {
   try {
      const res = await api.get('/page')
      dispatch({
         type: GET_PAGE,
         payload: res.data
      })
   } catch (err) {
      const errors = err.response.data.errors

      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: null,
            errors: errors
         }
      })
      // console.clear()
   }
}
// Update a task
export const optimisticMoveTask = (result, tasks, task_map) => {
   const { destination, source, draggableId } = result
   if (!destination || !source || !draggableId) {
      return
   }
   if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
   ) {
      return
   }

   // update front end simultaneously
   const startSpace = +source.droppableId
   const endSpace = +destination.droppableId
   const oldTaskId = +draggableId
   const targetTask = tasks[oldTaskId]
   var newTaskId = destination.index
   if (endSpace !== 0) {
      newTaskId += task_map[endSpace - 1]
   }
   if (endSpace > startSpace) {
      newTaskId--
   }
   const newTaskArray = cloneDeep(tasks)
   const newTaskMap = cloneDeep(task_map)
   newTaskArray.splice(oldTaskId, 1)
   newTaskArray.splice(newTaskId, 0, targetTask)

   // Moving between different columns
   if (endSpace < startSpace) {
      for (let i = endSpace; i < startSpace; i++) {
         newTaskMap[i]++
      }
   } else {
      for (let i = startSpace; i < endSpace; i++) {
         newTaskMap[i]--
      }
   }
   return {
      task_map: newTaskMap,
      tasks: newTaskArray
   }
}
export const moveTask = (reqData) => async (dispatch) => {
   dispatch({
      type: MOVE_TASK,
      payload: reqData.result
   })
   try {
      api.post(`/page/move-task/${reqData.page_id}`, reqData)
   } catch (err) {
      const errors = err.response.data.errors
      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: reqData.page_id,
            errors: errors
         }
      })
      // TODO: Revert state
      // console.clear()
   }
}
