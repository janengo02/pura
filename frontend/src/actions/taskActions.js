import { api } from '../utils'
import {
   CLEAR_TASK,
   CREATE_TASK,
   DELETE_TASK,
   GET_PAGE,
   SHOW_TASK,
   GOOGLE_CALENDAR_ADD_EVENT
} from './types'
import {
   pageActionErrorHandler,
   pageActionFatalErrorHandler
} from './pageActions'
import { googleAccountErrorHandler } from './googleAccountActions'

// Create new task
export const createTaskAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(`/task/new/${reqData.page_id}`, reqData)
      dispatch({
         type: CREATE_TASK,
         payload: {
            ...reqData,
            newTask: res.data.task
         }
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}

// Update a task
export const updateTaskAction = (formData) => async (dispatch) => {
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
   } catch (err) {
      pageActionErrorHandler(
         dispatch,
         err,
         formData.page_id,
         formData.task_detail_flg ? formData.task_id : null
      )
   }
}
// Delete a task
export const deleteTaskAction = (reqData) => async (dispatch) => {
   dispatch({
      type: DELETE_TASK,
      payload: {
         task_id: reqData.task_id
      }
   })
   dispatch({
      type: CLEAR_TASK
   })
   try {
      await api.delete(`/task/${reqData.page_id}/${reqData.task_id}`)
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}
// Show target task modal
export const showTaskModalAction = (formData) => async (dispatch) => {
   try {
      const res = await api.get(`/task/${formData.page_id}/${formData.task_id}`)
      dispatch({
         type: SHOW_TASK,
         payload: {
            ...res.data,
            ...(typeof formData.target_event_index === 'number' && {
               target_event_index: formData.target_event_index
            })
         }
      })
   } catch (err) {
      pageActionFatalErrorHandler(dispatch, formData.page_id, err)
   }
}
// Create new task
export const createTaskModalAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post(`/task/new/${reqData.page_id}`, reqData)
      const res_task = await api.get(
         `/task/${reqData.page_id}/${res.data.task._id}`
      )
      dispatch({
         type: SHOW_TASK,
         payload: {
            ...res_task.data
         }
      })
      dispatch({
         type: CREATE_TASK,
         payload: {
            ...reqData,
            newTask: res.data.task
         }
      })
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}

export const clearTaskAction = () => (dispatch) => {
   dispatch({
      type: CLEAR_TASK,
      payload: null
   })
}

/**
 * Create Google Event Action
 * Creates a new event in Google Calendar
 * @param {Object} reqData - Request data for event creation
 * @param {string} reqData.task_id - Task ID for the event
 * @param {Object} reqData.slot_index - Index of the time slot in the task schedule.
 * @param {string} reqData.account_id - Google account ID to use
 * @param {string} reqData.calendar_id - ID of the specific calendar to use
 */
export const syncTaskWithGoogleAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/task/sync-google-event', reqData)

      if (res.data?.task && res.data?.event) {
         dispatch({
            type: SHOW_TASK,
            payload: res.data.task
         })

         dispatch({
            type: GOOGLE_CALENDAR_ADD_EVENT,
            payload: {
               accountId: reqData.account_id,
               event: res.data.event
            }
         })
      } else {
         throw new Error(
            'Unexpected response format from /task/sync-google-event'
         )
      }
   } catch (err) {
      googleAccountErrorHandler(dispatch, err, reqData.account_id)
   }
}
