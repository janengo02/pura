import { api } from '../utils'
import { REGISTER_SUCCESS, REGISTER_FAIL } from './types'
import { setAlert, removeAllAlert } from './alert'
import { setLoading } from './loading'

// Register User
export const register = (formData) => async (dispatch) => {
   dispatch(setLoading.start)
   try {
      const res = await api.post('/users', formData)

      dispatch({
         type: REGISTER_SUCCESS,
         payload: res.data
      })
      dispatch(setLoading.end)
      dispatch(removeAllAlert())
   } catch (err) {
      dispatch(setLoading.end)

      const errors = err.response.data.errors

      if (errors) {
         errors.forEach((error) =>
            dispatch(setAlert(error.title, error.msg, 'error'))
         )
      }

      dispatch({
         type: REGISTER_FAIL
      })
   }
}
