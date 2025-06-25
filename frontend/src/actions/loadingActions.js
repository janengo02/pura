import { START_LOADING, END_LOADING } from './types'

// Loading state of the whole app (Not used for child components)
export const setLoadingAction = {
   start: (dispatch) => {
      dispatch({ type: START_LOADING })
   },
   end: (dispatch) => {
      dispatch({ type: END_LOADING })
   }
}
