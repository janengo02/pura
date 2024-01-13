import { api } from '../utils'
import { GET_PAGE, PAGE_ERROR } from './types'

// Get the first page of a user
export const getFirstPage = () => async (dispatch) => {
   try {
      const res = await api.get('/page')
      dispatch({
         type: GET_PAGE,
         payload: res.data
      })
   } catch (err) {
      const errors = err.response.data.errors

      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: null,
            errors: errors
         }
      })
      // console.clear()
   }
}
