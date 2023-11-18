import { api } from '../utils'
import {
   REGISTER_SUCCESS,
   REGISTER_FAIL,
   USER_LOADED,
   AUTH_ERROR,
   LOGIN_SUCCESS,
   LOGIN_FAIL,
   LOGOUT
} from './types'
import { setAlert, removeAllAlert } from './alert'
import { setLoading } from './loading'

// Load User
export const loadUser = () => async (dispatch) => {
   try {
      const res = await api.get('/auth')

      dispatch({
         type: USER_LOADED,
         payload: res.data
      })
   } catch (err) {
      dispatch({
         type: AUTH_ERROR
      })
   }
}
// Register User
export const register = (formData) => async (dispatch) => {
   dispatch(setLoading.start)
   try {
      const res = await api.post('/users', formData)
      dispatch(removeAllAlert())
      dispatch({
         type: REGISTER_SUCCESS,
         payload: res.data
      })
      dispatch(setLoading.end)
   } catch (err) {
      const errors = err.response.data.errors
      if (errors) {
         errors.forEach((error) =>
            dispatch(setAlert(error.title, error.msg, 'error'))
         )
      }
      dispatch({
         type: REGISTER_FAIL
      })
      dispatch(setLoading.end)
   }
}

// Login User
export const login = (formData) => async (dispatch) => {
   dispatch(setLoading.start)
   try {
      const res = await api.post('/auth', formData)
      dispatch(removeAllAlert())
      dispatch({
         type: LOGIN_SUCCESS,
         payload: res.data
      })

      dispatch(loadUser())
      dispatch(setLoading.end)
   } catch (err) {
      const errors = err.response.data.errors
      if (errors) {
         errors.forEach((error) =>
            dispatch(setAlert(error.title, error.msg, 'error'))
         )
      }
      dispatch({
         type: LOGIN_FAIL
      })
      dispatch(setLoading.end)
   }
}

// Logout
export const logout = () => ({ type: LOGOUT })
