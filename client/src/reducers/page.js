import { GET_PAGE, PAGE_ERROR } from '../actions/types'

const initialState = {
   page: null,
   pages: [],
   loading: true
}

function pageReducer(state = initialState, action) {
   const { type, payload } = action

   switch (type) {
      case GET_PAGE:
         return {
            ...state,
            page: payload,
            loading: false
         }
      // TODO: Handle error when page error
      case PAGE_ERROR:
         return {
            ...state,
            loading: false,
            page: null
         }
      default:
         return state
   }
}

export default pageReducer
