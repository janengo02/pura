import { v4 as uuid } from 'uuid'
import { api } from '../utils'
import {
   CREATE_GROUP,
   CONFIRM_CREATE_GROUP,
   DELETE_GROUP,
   PAGE_ERROR,
   UPDATE_GROUP
} from './types'

// Create new group
export const createGroup = (reqData) => async (dispatch) => {
   const tempGroupId = uuid()
   const optimisticGroup = {
      _id: tempGroupId,
      title: '',
      color: '#4A5568',
      visibility: true
   }
   dispatch({
      type: CREATE_GROUP,
      payload: optimisticGroup
   })
   try {
      const res = await api.post(`/group/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CONFIRM_CREATE_GROUP,
         payload: {
            temp_group_id: tempGroupId,
            group_id: res.data.group_id
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
      payload: {
         group_id: reqData.group_id
      }
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
