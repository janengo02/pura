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

/**
 * Handle fatal page errors
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} pageId - Page ID
 * @param {Object} err - Error object
 * @returns {void}
 */
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
/**
 * Handle page action errors
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} err - Error object
 * @param {string} [pageId] - Page ID (optional)
 * @param {string} [taskId] - Task ID (optional)
 * @returns {void}
 */
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
/**
 * Get the first page of a user
 * @returns {Function} Redux thunk
 */
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

/**
 * Drop task to new position (drag and drop)
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {Object} reqData.result - Drag and drop result
 * @returns {Function} Redux thunk
 */
export const dropTaskAction = (reqData) => async (dispatch) => {
   // Optimistic update - Page - update task position
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
/**
 * Filter tasks by schedule
 * @param {Object} reqData - Filter criteria
 * @returns {Function} Redux thunk
 */
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

/**
 * Filter tasks by name
 * @param {Object} reqData - Filter criteria
 * @returns {Function} Redux thunk
 */
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
