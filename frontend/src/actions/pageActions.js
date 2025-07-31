import { api } from '../utils'
import { setAlertAction } from './alertActions'
import { showTaskModalAction } from './taskActions'
import {
   FILTER_SCHEDULE,
   FILTER_NAME,
   GET_PAGE,
   DROP_TASK,
   PAGE_ERROR
} from './types'

// Helper for error dispatch
export const pageActionFatalErrorHandler = (dispatch, pageId, err) => {
   const errors = err?.response?.data?.errors || ['Unknown error']
   dispatch({
      type: PAGE_ERROR,
      payload: {
         _id: pageId,
         errors
      }
   })
}
// Helper for error dispatch
export const pageActionErrorHandler = (
   dispatch,
   err,
   pageId = null,
   taskId = null
) => {
   const errors = err?.response?.data?.errors || ['Unknown error']
   if (errors) {
      errors.forEach((error) =>
         dispatch(setAlertAction(error.title, error.msg, 'error'))
      )
   }
   dispatch(getFirstPageAction())
   if (pageId && taskId) {
      dispatch(
         showTaskModalAction({
            page_id: pageId,
            task_id: taskId
         })
      )
   }
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
      pageActionFatalErrorHandler(dispatch, null, err)
   }
}

export const dropTaskAction = (reqData) => async (dispatch) => {
   dispatch({
      type: DROP_TASK,
      payload: reqData.result
   })
   try {
      await api.post(`/page/move-task/${reqData.page_id}`, reqData)
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
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
