import cloneDeep from 'clone-deep'
import { api } from '../utils'
import { CREATE_GROUP, DELETE_GROUP, PAGE_ERROR, UPDATE_GROUP } from './types'

// Create new group
export const createGroup = (reqData) => async (dispatch) => {
   dispatch({
      type: CREATE_GROUP,
      payload: 'new'
   })
   try {
      const res = await api.post(`/group/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_GROUP,
         payload: res.data.group_id
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
export const updateGroup = (reqData) => async (dispatch) => {
   dispatch({
      type: UPDATE_GROUP,
      payload: reqData
   })
   try {
      await api.post(
         `/group/update/${reqData.page_id}/${reqData.group_id}`,
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
      // console.clear()
   }
}

// Delete a group
export const deleteGroup = (reqData) => async (dispatch) => {
   dispatch({
      type: DELETE_GROUP,
      payload: reqData.group_id
   })
   try {
      await api.delete(`/group/${reqData.page_id}/${reqData.group_id}`)
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

export const optimisticCreateGroup = (
   group_id,
   progress_order,
   group_order,
   task_map,
   tasks
) => {
   if (group_id === 'new') {
      const newGroup = {
         _id: 'new',
         title: '',
         color: '#4A5568',
         visibility: true
      }
      const newTaskMap = cloneDeep(task_map)
      const task_count = tasks.length
      for (let i = 1; i <= progress_order.length; i++) {
         newTaskMap.push(task_count)
      }
      const newGroupOrder = cloneDeep(group_order)
      newGroupOrder.push(newGroup)
      return { group_order: newGroupOrder, task_map: newTaskMap }
   } else {
      const newGroupOrder = group_order.map((g) =>
         g._id === 'new'
            ? {
                 ...g,
                 _id: group_id
              }
            : g
      )
      return { group_order: newGroupOrder }
   }
}

export const optimisticUpdateGroup = (updatedGroup, group_order) => {
   const { title, color, group_id } = updatedGroup
   const newGroupOrder = group_order.map((g) =>
      g._id === group_id
         ? {
              ...g,
              ...(title && { title }),
              ...(color && { color })
           }
         : g
   )
   return { group_order: newGroupOrder }
}

export const optimisticDeleteGroup = (
   group_id,
   progress_order,
   group_order,
   tasks,
   task_map
) => {
   const newTasks = cloneDeep(tasks)
   const newTaskMap = cloneDeep(task_map)
   const groupIndex = group_order.findIndex((g) => g._id === group_id)
   const progressCount = progress_order.length
   const mapStart = progressCount * groupIndex
   const mapEnd = mapStart + progressCount - 1
   let newTaskStart = 0
   if (mapStart !== 0) {
      newTaskStart = newTaskMap[mapStart - 1]
   }
   const newTaskEnd = newTaskMap[mapEnd] - 1

   //   Prepare: Set up new group_order
   const newGroupOrder = cloneDeep(group_order)
   newGroupOrder.splice(groupIndex, 1)

   //   Prepare: Set up new task_map
   let taskCount = newTaskMap[mapEnd]
   if (mapStart !== 0) {
      taskCount = newTaskMap[mapEnd] - newTaskMap[mapStart - 1]
   }
   for (let i = mapEnd + 1; i < newTaskMap.length; i++) {
      newTaskMap[i] -= taskCount
   }
   newTaskMap.splice(mapStart, mapEnd - mapStart + 1)
   newTasks.splice(newTaskStart, newTaskEnd - newTaskStart + 1)
   return { group_order: newGroupOrder, tasks: newTasks, task_map: newTaskMap }
}
