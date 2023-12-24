import { api } from '../utils'
import {
   REGISTER_SUCCESS,
   REGISTER_FAIL,
   USER_LOADED,
   AUTH_ERROR,
   LOGIN_SUCCESS,
   LOGIN_FAIL,
   LOGOUT,
   GET_PAGE
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
      const newPage = { title: 'My Page' }
      const newGroup = { title: 'MY GROUP' }
      const newProgress1 = {
         title: 'To do',
         title_color: '#B75151',
         color: '#FFE5E5'
      }
      const newProgress2 = {
         title: 'In Progress',
         title_color: '#E95F11',
         color: '#FFF0E4'
      }
      const newProgress3 = {
         title: 'Done',
         title_color: '#3E9C75',
         color: '#CDF4E4'
      }
      await api
         .post('/users', formData)
         .then((res) => {
            dispatch({
               type: REGISTER_SUCCESS,
               payload: res.data
            })
            return api.post('/page', newPage)
         })
         .then((resPage) => {
            return api.post(`/group/${resPage.data._id}`, newGroup)
         })
         .then((resPage) => {
            return api.post(`/progress/${resPage.data._id}`, newProgress1)
         })
         .then((resPage) => {
            return api.post(`/progress/${resPage.data._id}`, newProgress2)
         })
         .then((resPage) => {
            return api.post(`/progress/${resPage.data._id}`, newProgress3)
         })
         .then((resPage) => {
            const newTask = {
               group_id: resPage.data.group_order[0]._id,
               progress_id: resPage.data.progress_order[0]._id,
               title: 'My task'
            }
            return api.post(`/task/${resPage.data._id}`, newTask)
         })
      dispatch(loadUser())
      dispatch(removeAllAlert())
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
export const logout = () => async (dispatch) => {
   dispatch({ type: LOGOUT })
}
