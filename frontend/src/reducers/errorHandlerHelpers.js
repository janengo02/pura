import { setAlert } from './alertSlice'
/**
 * Handle page action errors
 * @param {Function} dispatch - Redux dispatch function
 * @param {Object} err - Error object
 * @param {Function} [getState] - Redux getState function (optional, for calendar reload and getting current state)
 * @returns {void}
 */
export const commonErrorHandler = (dispatch, err) => {
   const errors = err?.error?.data?.errors || err?.response?.data?.errors || [{title: 'Unknown error', msg: 'An unknown error occurred'}]
   if (errors) {
      errors.forEach((error) =>
         dispatch(setAlert(error.title, error.msg, 'error'))
      )
   }
}