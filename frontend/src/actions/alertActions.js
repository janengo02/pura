import { v4 as uuid } from 'uuid'
import { SET_ALERT, REMOVE_ALERT, REMOVE_ALL_ALERTS } from './types'

// Remove all alerts and set a new alert
export const setAlertAction = (title, msg, alertType) => (dispatch) => {
   dispatch({ type: REMOVE_ALL_ALERTS })
   const id = uuid()
   dispatch({
      type: SET_ALERT,
      payload: { title, msg, alertType, id }
   })
}

// Add a new alert to existing alerts
export const addAlertAction = (title, msg, alertType) => (dispatch) => {
   const id = uuid()
   dispatch({
      type: SET_ALERT,
      payload: { title, msg, alertType, id }
   })
}

// Remove an alert with a specific id
export const removeAlertAction = (id) => (dispatch) => {
   dispatch({ type: REMOVE_ALERT, payload: id })
}

// Remove an alert with a specific id
export const removeAllAlertAction = () => (dispatch) => {
   dispatch({ type: REMOVE_ALL_ALERTS })
}
