import { SHOW_EVENT_EDIT_MODAL, CLEAR_EVENT_EDIT_MODAL } from './types'

/**
 * Show event edit modal
 * @param {Object} event - Event object to edit
 * @returns {Function} Redux thunk
 */
export const showEventEditModalAction = (event) => (dispatch) => {
   dispatch({
      type: SHOW_EVENT_EDIT_MODAL,
      payload: event
   })
}

/**
 * Clear event edit modal
 * @returns {Function} Redux thunk
 */
export const clearEventEditModalAction = () => (dispatch) => {
   dispatch({
      type: CLEAR_EVENT_EDIT_MODAL,
      payload: null
   })
}
