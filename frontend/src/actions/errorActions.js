import { setAlert } from '../reducers/alertSlice'
import { loadCalendarAction } from './calendarActions'
import { getFirstPageAction } from './pageActions'
import { showTaskModalAction } from './taskActions'
import { PAGE_ERROR } from './types'

/**
 * Handle fatal page errors
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} pageId - Page ID
 * @param {Object} err - Error object
 * @returns {void}
 */
export const fatalErrorHandler = (dispatch, pageId, err) => {
   if (err?.isAuthExpired) {
      // Don't dispatch PAGE_ERROR for authentication expired errors since user is already logged out
      return
   }

   const errors = err?.response?.data?.errors || ['Unknown error']
   dispatch({
      type: PAGE_ERROR,
      payload: {
         id: pageId,
         errors
      }
   })

   // Note: Navigation is handled by components (like Kanban.jsx) that listen to Redux state changes
   // Components use useNavigate('/error', { state: errorState }) for proper React Router navigation
}
/**
 * Handle page action errors
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} err - Error object
 * @param {Function} [getState] - Redux getState function (optional, for calendar reload and getting current state)
 * @returns {void}
 */
export const commonErrorHandler = (dispatch, err, getState = null) => {
   const errors = err?.response?.data?.errors || ['Unknown error']
   if (errors) {
      errors.forEach((error) =>
         dispatch(setAlert(error.title, error.msg, 'error'))
      )
   }
   dispatch(getFirstPageAction())

   // If getState is provided, handle calendar reload and task modal
   if (getState) {
      const state = getState()
      const calendarRange = state.calendar?.range
      const currentPageId = state.page?.id
      const currentTaskId = state.task?.task?.id

      // Reload calendar if range and page ID are available
      if (calendarRange && calendarRange.length > 0 && currentPageId) {
         dispatch(loadCalendarAction(calendarRange, currentPageId))
      }

      // Show task modal if both page ID and task ID are available
      if (currentPageId && currentTaskId) {
         dispatch(
            showTaskModalAction({
               pageId: currentPageId,
               taskId: currentTaskId
            })
         )
      }
   }
}

/**
 * Handle auth action errors
 * @param {Function} dispatch - Redux dispatch function  
 * @param {Object} err - Error object
 * @returns {void}
 */
export const authActionErrorHandler = (dispatch, err) => {
   const errors = err?.response?.data?.errors || []
   if (errors.length > 0) {
      errors.forEach((error) =>
         dispatch(setAlert(error.title, error.msg, 'error'))
      )
   } else {
      // Fallback for non-API errors
      const message = err?.message || err?.response?.data?.message || 'Authentication failed'
      dispatch(setAlert('Authentication Error', message, 'error'))
   }
}
