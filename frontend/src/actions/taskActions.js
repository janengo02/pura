import { api } from '../utils'
import {
   CLEAR_TASK,
   CREATE_TASK,
   DELETE_TASK,
   GET_PAGE,
   SHOW_TASK,
   MOVE_TASK,
   UPDATE_TASK_BASIC,
   UPDATE_TASK_SCHEDULE,
   CREATE_TASK_SCHEDULE,
   SYNC_TASK_EVENT,
   DELETE_TASK_SCHEDULE
} from './types'
import {
   pageActionErrorHandler,
   pageActionFatalErrorHandler
} from './pageActions'
import { googleAccountErrorHandler } from './calendarActions'

/**
 * Create new task
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.group_id - Group ID
 * @param {string} reqData.progress_id - Progress ID
 * @param {string} [reqData.title] - Task title
 * @param {string} [reqData.content] - Task content
 * @returns {Function} Redux thunk
 */
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

/**
 * Delete a task
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.task_id - Task ID
 * @returns {Function} Redux thunk
 */
export const deleteTaskAction = (reqData) => async (dispatch) => {
   // Optimistic update - Page | Task | Calendar
   dispatch({
      type: DELETE_TASK,
      payload: {
         task_id: reqData.task_id
      }
   })
   try {
      await api.delete(`/task/${reqData.page_id}/${reqData.task_id}`)
   } catch (err) {
      pageActionErrorHandler(dispatch, err)
   }
}
/**
 * Show task modal with task details
 * @param {Object} formData - Form data
 * @param {string} formData.page_id - Page ID
 * @param {string} formData.task_id - Task ID
 * @param {number} [formData.target_event_index] - Target event index
 * @returns {Function} Redux thunk
 */
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
/**
 * Create new task and show modal
 * @param {Object} reqData - Request data
 * @param {string} reqData.page_id - Page ID
 * @param {string} reqData.group_id - Group ID
 * @param {string} reqData.progress_id - Progress ID
 * @returns {Function} Redux thunk
 */
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

/**
 * Clear task modal state
 * @returns {Function} Redux thunk
 */
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

      // Update - Page | Task | Calendar
      dispatch({
         type: SYNC_TASK_EVENT,
         payload: {
            task_id: reqData.task_id,
            slot_index: reqData.slot_index,
            google_event_id: res.data.event.id,
            calendar_id: reqData.calendar_id,
            account_email: reqData.account_email,
            sync_status: res.data.task.schedule[reqData.slot_index].sync_status,
            update_date: res.data.task.update_date,
            event: res.data.event,
            task: res.data.task
         }
      })
   } catch (err) {
      googleAccountErrorHandler(dispatch, err, reqData.account_email)
   }
}

/**
 * Update task basic info (title, content)
 * @param {Object} formData - Form data
 * @param {string} formData.page_id - Page ID
 * @param {string} formData.task_id - Task ID
 * @param {string} [formData.title] - Task title
 * @param {string} [formData.content] - Task content
 * @param {boolean} [formData.task_detail_flg] - Task detail flag
 * @returns {Function} Redux thunk
 */
export const updateTaskBasicInfoAction = (formData) => async (dispatch) => {
   // Optimistic update - Page | Task | Calendar
   dispatch({
      type: UPDATE_TASK_BASIC,
      payload: {
         task_id: formData.task_id,
         title: formData.title,
         content: formData.content,
         update_date: new Date().toISOString()
      }
   })

   try {
      await api.put(`/task/basic/${formData.page_id}/${formData.task_id}`, {
         title: formData.title,
         content: formData.content
      })
   } catch (err) {
      pageActionErrorHandler(
         dispatch,
         err,
         formData.page_id,
         formData.task_detail_flg ? formData.task_id : null
      )
   }
}

/**
 * Move task to different group/progress
 * @param {Object} formData - Form data
 * @param {string} formData.page_id - Page ID
 * @param {string} formData.task_id - Task ID
 * @param {Object} [formData.group] - Target group
 * @param {Object} [formData.progress] - Target progress
 * @param {boolean} [formData.task_detail_flg] - Task detail flag
 * @returns {Function} Redux thunk
 */
export const moveTaskAction = (formData) => async (dispatch) => {
   // Optimistic update - Task
   dispatch({
      type: MOVE_TASK,
      payload: {
         task_id: formData.task_id,
         group: formData.group,
         progress: formData.progress,
         update_date: new Date().toISOString()
      }
   })

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

/**
 * Update task schedule slot time
 * @param {Object} formData - Form data
 * @param {string} formData.page_id - Page ID
 * @param {string} formData.task_id - Task ID
 * @param {number} formData.slot_index - Slot index
 * @param {string} formData.start - Start time
 * @param {string} formData.end - End time
 * @param {boolean} [formData.task_detail_flg] - Task detail flag
 * @returns {Function} Redux thunk
 */
export const updateTaskScheduleAction = (formData) => async (dispatch) => {
   // Optimistic update - Page | Task | Calendar
   dispatch({
      type: UPDATE_TASK_SCHEDULE,
      payload: {
         task_id: formData.task_id,
         slot_index: formData.slot_index,
         start: formData.start,
         end: formData.end,
         update_date: new Date().toISOString(),
         target_event_index: formData.target_event_index
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

/**
 * Add new schedule slot to task
 * @param {Object} formData - Form data
 * @param {string} formData.page_id - Page ID
 * @param {string} formData.task_id - Task ID
 * @param {string} formData.start - Start time
 * @param {string} formData.end - End time
 * @param {boolean} [formData.task_detail_flg] - Task detail flag
 * @returns {Function} Redux thunk that returns {newSlotIndex}
 */
export const addTaskScheduleSlotAction = (formData) => async (dispatch) => {
   try {
      const newSlot = {
         start: formData.start,
         end: formData.end,
         google_event_id: null,
         google_calendar_id: null,
         google_account_email: null,
         sync_status: '0'
      }
      const newSlotIndex = formData.slot_index

      // Optimistic update - Page | Task
      dispatch({
         type: CREATE_TASK_SCHEDULE,
         payload: {
            task_id: formData.task_id,
            taskTitle: formData.task_title,
            taskContent: formData.task_content,
            newSlot: newSlot,
            newSlotIndex: newSlotIndex,
            update_date: new Date().toISOString()
         }
      })

      await api.post(`/task/schedule/${formData.page_id}/${formData.task_id}`, {
         start: formData.start,
         end: formData.end
      })
   } catch (err) {
      pageActionErrorHandler(
         dispatch,
         err,
         formData.page_id,
         formData.task_detail_flg ? formData.task_id : null
      )
   }
}

/**
 * Remove schedule slot from task
 * @param {Object} formData - Form data
 * @param {string} formData.page_id - Page ID
 * @param {string} formData.task_id - Task ID
 * @param {number} formData.slot_index - Slot index
 * @param {boolean} [formData.task_detail_flg] - Task detail flag
 * @returns {Function} Redux thunk
 */
export const removeTaskScheduleSlotAction = (formData) => async (dispatch) => {
   // Optimistic update - Page | Task | Calendar
   dispatch({
      type: DELETE_TASK_SCHEDULE,
      payload: {
         task_id: formData.task_id,
         slot_index: formData.slot_index,
         update_date: new Date().toISOString()
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
