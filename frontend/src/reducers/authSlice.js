import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { api } from '../utils'
import setAuthToken from '../utils/setAuthToken'
import { startLoading, endLoading } from './loadingSlice'
import { removeAllAlerts } from './alertSlice'
import { authActionErrorHandler } from '../actions/errorActions'

/**
 * Load User Action
 * Fetches the authenticated user's data
 */
export const loadUser = createAsyncThunk(
   'auth/loadUser',
   async (_, { rejectWithValue, dispatch }) => {
      try {
         dispatch(startLoading())
         const res = await api.get('/auth')
         dispatch(endLoading())
         return res.data
      } catch (err) {
         dispatch(endLoading())
         return rejectWithValue('Authentication failed')
      }
   }
)

/**
 * Register User Action
 * Registers a new user with language support for default content
 * @param {Object} formData - Registration form data
 * @param {string} formData.name - User's name
 * @param {string} formData.email - User's email
 * @param {string} formData.password - User's password
 * @param {string} formData.language - User's preferred language ('en' or 'ja')
 */
export const register = createAsyncThunk(
   'auth/register',
   async (formData, { rejectWithValue, dispatch }) => {
      try {
         dispatch(removeAllAlerts())
         dispatch(startLoading())

         // Send registration data including language preference
         const res = await api.post('/users', formData)

         // Store both tokens if returned
         if (res.data.token && res.data.refreshToken) {
            setAuthToken(res.data.token, res.data.refreshToken)
         }
         // Load user data after successful registration
         dispatch(loadUser())
         dispatch(endLoading())
         return res.data
      } catch (err) {
         dispatch(endLoading())
         authActionErrorHandler(dispatch, err)
         const errors = err?.response?.data?.errors || []
         return rejectWithValue({
            message: err?.response?.data?.message || 'Registration failed',
            errors: errors
         })
      }
   }
)


/**
 * Login User Action
 * Authenticates an existing user
 * @param {Object} formData - Login form data
 * @param {string} formData.email - User's email
 * @param {string} formData.password - User's password
 */
export const login = createAsyncThunk(
   'auth/login',
   async (formData, { rejectWithValue, dispatch }) => {
      try {
         dispatch(removeAllAlerts())
         dispatch(startLoading())

         const res = await api.post('/auth', formData)

         // Store both tokens
         setAuthToken(res.data.token, res.data.refreshToken)

         // Load user data after successful login
         dispatch(loadUser())
         dispatch(endLoading())

         return res.data
      } catch (err) {
         dispatch(endLoading())
         authActionErrorHandler(dispatch, err)
         const errors = err?.response?.data?.errors || []
         return rejectWithValue({
            message: err?.response?.data?.message || 'Login failed',
            errors: errors
         })
      }
   }
)

/**
 * Logout Action
 * Logs out the current user
 */
export const logout = createAsyncThunk(
   'auth/logout',
   async (_, { dispatch }) => {
      // Clear the auth token
      setAuthToken()
      return null
   }
)

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
      // No synchronous reducers
   },
   extraReducers: (builder) => {
      builder
         // Load User
         .addCase(loadUser.fulfilled, (state, action) => {
            state.isAuthenticated = true
            state.user = action.payload
         })
         .addCase(loadUser.rejected, (state) => {
            state.token = null
            state.refreshToken = null
            state.isAuthenticated = false
            state.user = null
         })
         // Register
         .addCase(register.fulfilled, (state, action) => {
            state.token = action.payload.token
            state.refreshToken = action.payload.refreshToken
            state.isAuthenticated = true
         })
         .addCase(register.rejected, (state) => {
            state.token = null
            state.refreshToken = null
            state.isAuthenticated = false
            state.user = null
         })
         // Login
         .addCase(login.fulfilled, (state, action) => {
            state.token = action.payload.token
            state.refreshToken = action.payload.refreshToken
            state.isAuthenticated = true
         })
         .addCase(login.rejected, (state) => {
            state.token = null
            state.refreshToken = null
            state.isAuthenticated = false
            state.user = null
         })
         // Logout
         .addCase(logout.fulfilled, (state) => {
            state.token = null
            state.refreshToken = null
            state.isAuthenticated = false
            state.user = null
         })
   }
})

// Export reducer
export default authSlice.reducer