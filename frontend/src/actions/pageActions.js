import { api } from '../utils'
import { GET_PAGE, MOVE_TASK, PAGE_ERROR } from './types'

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

export const moveTaskAction = (reqData) => async (dispatch) => {
   dispatch({
      type: MOVE_TASK,
      payload: reqData.result
   })
   try {
      api.post(`/page/move-task/${reqData.page_id}`, reqData)
   } catch (err) {
      const errors = err.response.data.errors
      dispatch({
         type: PAGE_ERROR,
         payload: {
            _id: reqData.page_id,
            errors: errors
         }
      })
      // TODO: Revert state
      // console.clear()
   }
}
