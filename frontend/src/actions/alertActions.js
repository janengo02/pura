import { v4 as uuid } from 'uuid'
import { SET_ALERT, REMOVE_ALERT, REMOVE_ALL_ALERTS } from './types'

/**
 * Remove all alerts and set a new alert
 * @param {string} title - Alert title key
 * @param {string} msg - Alert message key
 * @param {string} alertType - Alert type ('error', 'success', 'warning', 'info')
 * @returns {Function} Redux thunk
 */
export const setAlertAction = (title, msg, alertType) => (dispatch) => {
   dispatch({ type: REMOVE_ALL_ALERTS })
   const id = uuid()
   dispatch({
      type: SET_ALERT,
      payload: { title, msg, alertType, id }
   })
}

/**
 * Add a new alert to existing alerts
 * @param {string} title - Alert title key
 * @param {string} msg - Alert message key
 * @param {string} alertType - Alert type ('error', 'success', 'warning', 'info')
 * @returns {Function} Redux thunk
 */
export const addAlertAction = (title, msg, alertType) => (dispatch) => {
   const id = uuid()
   dispatch({
      type: SET_ALERT,
      payload: { title, msg, alertType, id }
   })
}

/**
 * Remove an alert with a specific id
 * @param {string} id - Alert ID to remove
 * @returns {Function} Redux thunk
 */
export const removeAlertAction = (id) => (dispatch) => {
   dispatch({ type: REMOVE_ALERT, payload: id })
}

/**
 * Remove all alerts
 * @returns {Function} Redux thunk
 */
export const removeAllAlertAction = () => (dispatch) => {
   console.log('Cleared all alerts')
   dispatch({ type: REMOVE_ALL_ALERTS })
}
