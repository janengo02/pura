import { api } from '../utils'
import { SHOW_EVENT_EDIT_MODAL, CLEAR_EVENT_EDIT_MODAL } from './types'

// Event Edit Modal Actions
export const showEventEditModalAction = (event) => (dispatch) => {
   dispatch({
      type: SHOW_EVENT_EDIT_MODAL,
      payload: event
   })
}

export const clearEventEditModalAction = () => (dispatch) => {
   dispatch({
      type: CLEAR_EVENT_EDIT_MODAL,
      payload: null
   })
}
