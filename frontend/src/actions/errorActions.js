import { setAlert } from '../reducers/alertSlice'
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
