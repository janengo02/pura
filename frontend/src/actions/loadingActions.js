import { START_LOADING, END_LOADING } from './types'

/**
 * Loading state actions for the whole app
 * @property {Function} start - Start loading action
 * @property {Function} end - End loading action
 */
export const setLoadingAction = {
   /**
    * Start loading state
    * @param {Function} dispatch - Redux dispatch function
    */
   start: (dispatch) => {
      dispatch({ type: START_LOADING })
   },
   /**
    * End loading state
    * @param {Function} dispatch - Redux dispatch function
    */
   end: (dispatch) => {
      dispatch({ type: END_LOADING })
   }
}
