// =============================================================================
// IMPORTS
// =============================================================================

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
import { clearTaskAction } from './taskActions'

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Helper for error handling in auth actions
 * @param {Object} err - Error object
 * @param {Function} dispatch - Redux dispatch function
 * @param {string} failType - Action type for failure
 */
const authActionErrorHandler = (err, dispatch, failType) => {
   const errors = err?.response?.data?.errors
   if (errors) {
      errors.forEach((error) =>
         dispatch(setAlertAction(error.title, error.msg, 'error'))
      )
   }
   dispatch({ type: failType })
}

// =============================================================================
// ACTION CREATORS
// =============================================================================

/**
 * Load User Action
 * Fetches the authenticated user's data
 */
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

/**
 * Register User Action
 * Registers a new user with language support for default content
 * @param {Object} formData - Registration form data
 * @param {string} formData.name - User's name
 * @param {string} formData.email - User's email
 * @param {string} formData.password - User's password
 * @param {string} formData.language - User's preferred language ('en' or 'ja')
 */
export const registerAction = (formData) => async (dispatch) => {
   dispatch(setLoadingAction.start)
   try {
      // Send registration data including language preference
      const res = await api.post('/users', formData)

      dispatch({
         type: REGISTER_SUCCESS,
         payload: res.data
      })

      // Load user data after successful registration
      dispatch(loadUserAction())

      // Clear any existing alerts
      dispatch(removeAllAlertAction())
   } catch (err) {
      authActionErrorHandler(err, dispatch, REGISTER_FAIL)
   }
   dispatch(setLoadingAction.end)
}

/**
 * Login User Action
 * Authenticates an existing user
 * @param {Object} formData - Login form data
 * @param {string} formData.email - User's email
 * @param {string} formData.password - User's password
 */
export const loginAction = (formData) => async (dispatch) => {
   dispatch(setLoadingAction.start)
   try {
      const res = await api.post('/auth', formData)

      dispatch(removeAllAlertAction())
      dispatch({
         type: LOGIN_SUCCESS,
         payload: res.data
      })
      dispatch(clearTaskAction())

      dispatch(loadUserAction())
   } catch (err) {
      authActionErrorHandler(err, dispatch, LOGIN_FAIL)
   }
   dispatch(setLoadingAction.end)
}

/**
 * Logout Action
 * Logs out the current user
 */
export const logoutAction = () => async (dispatch) => {
   dispatch({ type: LOGOUT })
}
