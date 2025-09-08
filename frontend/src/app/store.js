import { configureStore } from '@reduxjs/toolkit'
import { baseApi } from '../shared/api/baseApi'
import setAuthToken from '../features/auth/setAuthToken'
import rootReducer from './rootReducer'

const store = configureStore({
   reducer: rootReducer,
   middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
         serializableCheck: {
            ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
         }
      }).concat(baseApi.middleware),
   devTools: process.env.NODE_ENV !== 'production'
})

let currentState = store.getState()

store.subscribe(() => {
   // keep track of the previous and current state to compare changes
   const previousState = currentState
   currentState = store.getState()
   // if the token changes set the value in localStorage and axios headers
   if (previousState.auth?.token !== currentState.auth?.token) {
      const token = currentState.auth?.token
      const refreshToken = currentState.auth?.refreshToken
      setAuthToken(token, refreshToken)
   }
})

export default store
