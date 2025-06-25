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
import { setAlertAction, removeAllAlertAction } from './alertActions'
import { setLoadingAction } from './loadingActions'

// Helper for error handling
const authActionErrorHandler = (err, dispatch, failType) => {
   const errors = err?.response?.data?.errors
   if (errors) {
      errors.forEach((error) =>
         dispatch(setAlertAction(error.title, error.msg, 'error'))
      )
   }
   dispatch({ type: failType })
}

// Load User
export const loadUserAction = () => async (dispatch) => {
   dispatch(setLoadingAction.start)
   try {
      const res = await api.get('/auth')
      dispatch({
         type: USER_LOADED,
         payload: res.data
      })
   } catch (err) {
      authActionErrorHandler(err, dispatch, AUTH_ERROR)
   }
   dispatch(setLoadingAction.end)
}

// Register User
export const registerAction = (formData) => async (dispatch) => {
   dispatch(setLoadingAction.start)
   try {
      const res = await api.post('/users', formData)
      dispatch({
         type: REGISTER_SUCCESS,
         payload: res.data
      })
      dispatch(loadUserAction())
      dispatch(removeAllAlertAction())
   } catch (err) {
      authActionErrorHandler(err, dispatch, REGISTER_FAIL)
   }
   dispatch(setLoadingAction.end)
}

// Login User
export const loginAction = (formData) => async (dispatch) => {
   dispatch(setLoadingAction.start)
   try {
      const res = await api.post('/auth', formData)
      dispatch(removeAllAlertAction())
      dispatch({
         type: LOGIN_SUCCESS,
         payload: res.data
      })
      dispatch(loadUserAction())
   } catch (err) {
      authActionErrorHandler(err, dispatch, LOGIN_FAIL)
   }
   dispatch(setLoadingAction.end)
}

// Logout
export const logoutAction = () => async (dispatch) => {
   dispatch({ type: LOGOUT })
}
