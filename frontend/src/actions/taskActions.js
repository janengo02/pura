import { api } from '../utils'
import {
   CLEAR_TASK,
   CREATE_TASK,
   DELETE_TASK,
   GET_PAGE,
   SHOW_TASK,
   MOVE_TASK,
   UPDATE_TASK,
   UPDATE_TASK_SCHEDULE,
   REMOVE_TASK_SCHEDULE_SLOT,
   REMOVE_PAGE_TASK_SCHEDULE_SLOT,
   GOOGLE_CALENDAR_UPDATE_TASK_EVENT,
   GOOGLE_CALENDAR_UPDATE_TASK_SCHEDULE,
   GOOGLE_CALENDAR_REMOVE_TASK_SCHEDULE_SLOT,
   GOOGLE_CALENDAR_DELETE_TASK_EVENTS
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

// Delete a task
export const deleteTaskAction = (reqData) => async (dispatch) => {
   dispatch({
      type: DELETE_TASK,
      payload: {
         task_id: reqData.task_id
      }
   })
   dispatch({
      type: GOOGLE_CALENDAR_DELETE_TASK_EVENTS,
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
 * @param {string} reqData.account_email - Google account email to use
 * @param {string} reqData.calendar_id - ID of the specific calendar to use
 */
export const syncTaskWithGoogleAction = (reqData) => async (dispatch) => {
   try {
      const res = await api.post('/task/sync-google-event', reqData)

      dispatch({
         type: GET_PAGE,
         payload: res.data.page
      })
      dispatch({
         type: SHOW_TASK,
         payload: res.data.task
      })
   } catch (err) {
      googleAccountErrorHandler(dispatch, err, reqData.account_email)
   }
}

// Update task basic info (title, content)
export const updateTaskBasicInfoAction = (formData) => async (dispatch) => {
   // Optimistic update - update state before API call
   dispatch({
      type: UPDATE_TASK,
      payload: {
         task_id: formData.task_id,
         title: formData.title,
         content: formData.content,
         update_date: new Date().toISOString()
      }
   })

   // Update Google calendar events optimistically for task and synced events
   dispatch({
      type: GOOGLE_CALENDAR_UPDATE_TASK_EVENT,
      payload: {
         task_id: formData.task_id,
         title: formData.title,
         description: formData.content,
         update_date: new Date().toISOString()
      }
   })

   try {
      await api.put(`/task/basic/${formData.page_id}/${formData.task_id}`, {
         title: formData.title,
         content: formData.content
      })
   } catch (err) {
      // On error, we could revert the optimistic update here
      // For now, let the page refresh handle it
      pageActionErrorHandler(
         dispatch,
         err,
         formData.page_id,
         formData.task_detail_flg ? formData.task_id : null
      )
   }
}

// Move task to different group/progress
export const moveTaskAction = (formData) => async (dispatch) => {
   // Optimistic update for task modal if open
   if (formData.task_detail_flg) {
      dispatch({
         type: MOVE_TASK,
         payload: {
            task_id: formData.task_id,
            group: formData.group,
            progress: formData.progress,
            update_date: new Date().toISOString()
         }
      })
   }

   try {
      const res = await api.put(
         `/task/move/${formData.page_id}/${formData.task_id}`,
         {
            group_id: formData.group?._id,
            progress_id: formData.progress?._id
         }
      )

      dispatch({
         type: GET_PAGE,
         payload: res.data.page
      })
   } catch (err) {
      console.error('Error moving task:', err)
      pageActionErrorHandler(
         dispatch,
         err,
         formData.page_id,
         formData.task_detail_flg ? formData.task_id : null
      )
   }
}

// Update task schedule slot time
export const updateTaskScheduleAction = (formData) => async (dispatch) => {
   // Optimistic update for task modal if open
   if (formData.task_detail_flg) {
      dispatch({
         type: UPDATE_TASK_SCHEDULE,
         payload: {
            task_id: formData.task_id,
            slot_index: formData.slot_index,
            start: formData.start,
            end: formData.end,
            update_date: new Date().toISOString()
         }
      })
   }

   // Update Google calendar events optimistically
   dispatch({
      type: GOOGLE_CALENDAR_UPDATE_TASK_SCHEDULE,
      payload: {
         task_id: formData.task_id,
         slot_index: formData.slot_index,
         start: formData.start,
         end: formData.end
      }
   })

   try {
      await api.put(
         `/task/schedule/${formData.page_id}/${formData.task_id}/${formData.slot_index}`,
         {
            start: formData.start,
            end: formData.end
         }
      )
   } catch (err) {
      pageActionErrorHandler(
         dispatch,
         err,
         formData.page_id,
         formData.task_detail_flg ? formData.task_id : null
      )
   }
}

// Add new schedule slot to task
export const addTaskScheduleSlotAction = (formData) => async (dispatch) => {
   try {
      const res = await api.post(
         `/task/schedule/${formData.page_id}/${formData.task_id}`,
         {
            start: formData.start,
            end: formData.end
         }
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

      return { newSlotIndex: res.data.newSlotIndex }
   } catch (err) {
      pageActionErrorHandler(
         dispatch,
         err,
         formData.page_id,
         formData.task_detail_flg ? formData.task_id : null
      )
   }
}

// Remove schedule slot from task
export const removeTaskScheduleSlotAction = (formData) => async (dispatch) => {
   // Optimistic update for page state
   dispatch({
      type: REMOVE_PAGE_TASK_SCHEDULE_SLOT,
      payload: {
         task_id: formData.task_id,
         slot_index: formData.slot_index,
         update_date: new Date().toISOString()
      }
   })

   dispatch({
      type: REMOVE_TASK_SCHEDULE_SLOT,
      payload: {
         task_id: formData.task_id,
         slot_index: formData.slot_index,
         update_date: new Date().toISOString()
      }
   })

   // Remove Google calendar events optimistically
   dispatch({
      type: GOOGLE_CALENDAR_REMOVE_TASK_SCHEDULE_SLOT,
      payload: {
         task_id: formData.task_id,
         slot_index: formData.slot_index
      }
   })

   try {
      await api.delete(
         `/task/schedule/${formData.page_id}/${formData.task_id}/${formData.slot_index}`
      )
   } catch (err) {
      pageActionErrorHandler(
         dispatch,
         err,
         formData.page_id,
         formData.task_detail_flg ? formData.task_id : null
      )
   }
}
