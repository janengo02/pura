import { v4 as uuid } from 'uuid'
import { api } from '../utils'
import {
   CREATE_GROUP,
   CONFIRM_CREATE_GROUP,
   DELETE_GROUP,
   UPDATE_GROUP
} from './types'

import { pageActionErrorHandler } from './pageActions'

// Create new group
export const createGroupAction = (reqData) => async (dispatch) => {
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
      pageActionErrorHandler(dispatch, reqData.page_id, err)
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
      pageActionErrorHandler(dispatch, reqData.page_id, err)
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
      pageActionErrorHandler(dispatch, reqData.page_id, err)
   }
}
