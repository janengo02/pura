import { api } from '../utils'
import { CREATE_GROUP, DELETE_GROUP, UPDATE_GROUP } from './types'

import { pageActionErrorHandler } from './pageActions'

// Create new group
export const createGroupAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(`/group/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_GROUP,
         payload: res.data.group
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}

// Update a group
export const updateGroupAction = (reqData) => async (dispatch) => {
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
      pageActionErrorHandler(dispatch, err)
   }
}

// Delete a group
export const deleteGroupAction = (reqData) => async (dispatch) => {
   dispatch({
      type: DELETE_GROUP,
      payload: {
         group_id: reqData.group_id
      }
   })
   try {
      await api.delete(`/group/${reqData.page_id}/${reqData.group_id}`)
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}
