import { v4 as uuidv4 } from 'uuid'
import { SET_ALERT, REMOVE_ALERT, REMOVE_ALL_ALERTS } from './types'

// Remove all alerts and set a new alert
export const setAlert = (title, msg, alertType) => (dispatch) => {
  dispatch({ type: REMOVE_ALL_ALERTS })
  const id = uuidv4()
  dispatch({
    type: SET_ALERT,
    payload: { title, msg, alertType, id }
  })
}

// Add a new alert to existing alerts
export const addAlert = (title, msg, alertType) => (dispatch) => {
  const id = uuidv4()
  dispatch({
    type: SET_ALERT,
    payload: { title, msg, alertType, id }
  })
}

// Remove an alert with a specific id
export const removeAlert = (id) => (dispatch) => {
  dispatch({ type: REMOVE_ALERT, payload: id })
}

// Remove an alert with a specific id
export const removeAllAlert = () => (dispatch) => {
  dispatch({ type: REMOVE_ALL_ALERTS })
}
