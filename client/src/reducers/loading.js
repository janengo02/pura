import { START_LOADING, END_LOADING } from '../actions/types'

const initialState = false

function loadingReducer(state = initialState, action) {
  const { type } = action

  switch (type) {
    case START_LOADING:
      return true
    case END_LOADING:
      return false
    default:
      return state
  }
}

export default loadingReducer
