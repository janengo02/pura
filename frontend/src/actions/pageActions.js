import { api } from '../utils'
import {
   FILTER_SCHEDULE,
   FILTER_NAME,
   GET_PAGE,
   MOVE_TASK,
   PAGE_ERROR
} from './types'

// Helper for error dispatch
export const pageActionErrorHandler = (dispatch, pageId, err) => {
   const errors = err?.response?.data?.errors || ['Unknown error']
   dispatch({
      type: PAGE_ERROR,
      payload: {
         _id: pageId,
         errors
      }
   })
}
// Get the first page of a user
export const getFirstPageAction = () => async (dispatch) => {
   try {
      const res = await api.get('/page')
      dispatch({
         type: GET_PAGE,
         payload: res.data
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, null, err)
   }
}

export const moveTaskAction = (reqData) => async (dispatch) => {
   dispatch({
      type: MOVE_TASK,
      payload: reqData.result
   })
   try {
      api.post(`/page/move-task/${reqData.page_id}`, reqData)
   } catch (err) {
      pageActionErrorHandler(dispatch, reqData.page_id, err)
   }
}
export const filterSchedule = (reqData) => async (dispatch) => {
   // Save reqData to cache (localStorage as an example)
   localStorage.setItem('filteredSchedule', JSON.stringify(reqData))
   dispatch({
      type: FILTER_SCHEDULE,
      payload: {
         schedule: reqData
      }
   })
}

export const filterName = (reqData) => async (dispatch) => {
   // Save reqData to cache (localStorage as an example)
   localStorage.setItem('filteredName', JSON.stringify(reqData))
   dispatch({
      type: FILTER_NAME,
      payload: {
         name: reqData
      }
   })
}
