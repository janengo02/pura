import { GET_PAGE, PAGE_ERROR } from '../actions/types'

const initialState = {
   page: null,
   pages: [],
   loading: true,
   error: {}
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
      case PAGE_ERROR:
         return {
            ...state,
            error: payload,
            loading: false,
            page: null
         }
      default:
         return state
   }
}

export default pageReducer
