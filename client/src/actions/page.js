import { api } from '../utils'
import { GET_PAGE, PAGE_ERROR } from './types'
import { setAlert, removeAllAlert } from './alert'

// Get the first page of a user
export const getFirstPage = () => async (dispatch) => {
   try {
      const res = await api.get('/page')
      dispatch(removeAllAlert())

      dispatch({
         type: GET_PAGE,
         payload: res.data
      })
   } catch (err) {
      const errors = err.response.data.errors
      if (errors) {
         errors.forEach((error) =>
            dispatch(setAlert(error.title, error.msg, 'error'))
         )
      }
      dispatch({
         type: PAGE_ERROR,
         payload: { msg: err.response }
      })
   }
}
