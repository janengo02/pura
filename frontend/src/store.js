import { configureStore } from '@reduxjs/toolkit'
import rootReducer from './reducers'
import setAuthToken from './utils/setAuthToken'

const store = configureStore({
   reducer: rootReducer,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
         }
      }),
   devTools: process.env.NODE_ENV !== 'production'
})

/*
  NOTE: set up a store subscription listener
  to store the users token in localStorage
 */

/*
  initialize current state from redux store for subscription comparison
  preventing undefined error
 */
let currentState = store.getState()

store.subscribe(() => {
   // keep track of the previous and current state to compare changes
   let previousState = currentState
   currentState = store.getState()
   // if the token changes set the value in localStorage and axios headers
   if (previousState.auth.token !== currentState.auth.token) {
      const token = currentState.auth.token
      const refreshToken = currentState.auth.refreshToken
      setAuthToken(token, refreshToken)
   }
})

export default store
