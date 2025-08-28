import { createSlice } from '@reduxjs/toolkit'
import setAuthToken from '../utils/setAuthToken'
import { authApi } from '../api/authApi'

const initialState = {
   token: localStorage.getItem('token'),
   refreshToken: localStorage.getItem('refreshToken'),
   isAuthenticated: null,
   user: null
}

const authSlice = createSlice({
   name: 'auth',
   initialState,
   reducers: {
      logout: (state) => {
         setAuthToken()
         state.token = null
         state.refreshToken = null
         state.isAuthenticated = false
         state.user = null
      },
      setCredentials: (state, action) => {
         const { token, refreshToken, user } = action.payload
         if (token && refreshToken) {
            setAuthToken(token, refreshToken)
            state.token = token
            state.refreshToken = refreshToken
            state.isAuthenticated = true
         }
         if (user) {
            state.user = user
         }
      }
   },
   extraReducers: (builder) => {
      builder
         // Load User
         .addMatcher(
            authApi.endpoints.loadUser.matchFulfilled,
            (state, action) => {
               state.isAuthenticated = true
               state.user = action.payload
            }
         )
         .addMatcher(
            authApi.endpoints.loadUser.matchRejected,
            (state) => {
               state.token = null
               state.refreshToken = null
               state.isAuthenticated = false
               state.user = null
            }
         )
         // Register
         .addMatcher(
            authApi.endpoints.register.matchFulfilled,
            (state, action) => {
               if (action.payload.token && action.payload.refreshToken) {
                  setAuthToken(action.payload.token, action.payload.refreshToken)
                  state.token = action.payload.token
                  state.refreshToken = action.payload.refreshToken
                  state.isAuthenticated = true
               }
            }
         )
         .addMatcher(
            authApi.endpoints.register.matchRejected,
            (state) => {
               state.token = null
               state.refreshToken = null
               state.isAuthenticated = false
               state.user = null
            }
         )
         // Login
         .addMatcher(
            authApi.endpoints.login.matchFulfilled,
            (state, action) => {
               if (action.payload.token && action.payload.refreshToken) {
                  setAuthToken(action.payload.token, action.payload.refreshToken)
                  state.token = action.payload.token
                  state.refreshToken = action.payload.refreshToken
                  state.isAuthenticated = true
               }
            }
         )
         .addMatcher(
            authApi.endpoints.login.matchRejected,
            (state) => {
               state.token = null
               state.refreshToken = null
               state.isAuthenticated = false
               state.user = null
            }
         )
   }
})

// Export actions
export const { logout, setCredentials } = authSlice.actions

// Export reducer
export default authSlice.reducer