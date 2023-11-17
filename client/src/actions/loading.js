import { START_LOADING, END_LOADING } from './types'

export const setLoading = {
  start : (dispatch) => {
    dispatch({ type: START_LOADING })
  },
  end : (dispatch) => {
    dispatch({ type: END_LOADING })
  }
}