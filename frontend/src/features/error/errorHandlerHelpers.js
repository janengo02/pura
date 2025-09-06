import { setAlert } from '../ui/alertSlice'
import { refetchTaskModal } from '../task/api/taskApi'
import { refetchCalendar } from '../calendar/api/calendarApi'
import { refetchPage } from '../kanban/api/pageApi'
/**
 * Handle page action errors and automatically refetch relevant data
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} err - Error object
 * @param {Function} [getState] - Redux getState function (optional, for refetch operations)
 * @param {Object} [baseApi] - RTK Query base API instance (optional, for refetch operations)
 * @param {Object} [options] - Options for refetch behavior
 * @param {boolean} [options.refetchTaskModal=false] - Whether to refetch task modal
 * @param {boolean} [options.refetchCalendar=false] - Whether to refetch calendar
 * @param {boolean} [options.refetchPage=false] - Whether to refetch page
 * @returns {void}
 */
export const commonErrorHandler = (dispatch, err, getState = null, baseApi = null, options = {}) => {
   const {
      refetchTaskModal: shouldRefetchTaskModal = false,
      refetchCalendar: shouldRefetchCalendar = false,
      refetchPage: shouldRefetchPage = false
   } = options

   // Handle error alerts
   const errors = err?.error?.data?.errors || err?.response?.data?.errors || [{title: 'Unknown error', msg: 'An unknown error occurred'}]
   if (errors) {
      errors.forEach((error) =>
         dispatch(setAlert(error.title, error.msg, 'error'))
      )
   }

   // Refetch data if getState and baseApi are provided
   if (getState && baseApi) {
      try {
         if (shouldRefetchTaskModal) {
            refetchTaskModal(dispatch, getState, baseApi)
         }
         if (shouldRefetchCalendar) {
            refetchCalendar(dispatch, getState, baseApi)
         }
         if (shouldRefetchPage) {
            refetchPage(dispatch, getState, baseApi)
         }
      } catch (refetchError) {
         // Error is handled by individual RTK Query hooks
      }
   }
}