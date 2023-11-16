import { v4 as uuidv4 } from 'uuid'
import { SET_ALERT } from './types'

export const setAlert =
  (title, msg, alertType) =>
  (dispatch) => {
    const id = uuidv4()
    dispatch({
      type: SET_ALERT,
      payload: { title, msg, alertType, id }
    })
  }
