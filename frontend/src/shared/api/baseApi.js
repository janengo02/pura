import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { setCredentials } from '../../features/auth/authSlice'
import { logout } from '../../features/auth/authSlice'
import { apiUrl } from '../../config/env'

const API_URL = apiUrl

// Custom error class for authentication session expiration
class AuthenticationExpiredError extends Error {
  constructor(message = 'Authentication session expired') {
    super(message)
    this.name = 'AuthenticationExpiredError'
    this.isAuthExpired = true
  }
}

const baseQuery = fetchBaseQuery({
  baseUrl:`${API_URL}/api/v1`,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth?.token
    if (token) {
      headers.set('x-auth-token', token)
    }
    return headers
  }
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })

  failedQueue = []
}

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    const originalArgs = args

    // Don't retry auth requests to avoid infinite loops
    if (typeof originalArgs === 'string' && originalArgs.includes('/auth/refresh')) {
      return result
    }
    if (originalArgs.url && originalArgs.url.includes('/auth/refresh')) {
      return result
    }

    // Handle concurrent requests during token refresh
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject })
      }).then((token) => {
        // Retry the original request with new token
        return baseQuery(args, api, extraOptions)
      }).catch((err) => {
        return { error: err }
      })
    }

    isRefreshing = true

    const refreshToken = localStorage.getItem('refreshToken')

    if (refreshToken) {
      try {
        // Attempt to refresh the token
        const refreshResult = await baseQuery({
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken }
        }, api, extraOptions)

        if (refreshResult.data) {
          const { token, refreshToken: newRefreshToken } = refreshResult.data

          // Update the auth state - dynamic import to avoid circular dependency
          api.dispatch(setCredentials({ token, refreshToken: newRefreshToken }))

          processQueue(null, token)

          // Retry the original request
          result = await baseQuery(args, api, extraOptions)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        processQueue(refreshError, null)

        api.dispatch(logout())

        // Return custom error to prevent further error handling
        return { error: new AuthenticationExpiredError() }
      } finally {
        isRefreshing = false
      }
    } else {
      api.dispatch(logout())
      return { error: new AuthenticationExpiredError() }
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Task', 'Page', 'Calendar', 'Auth', 'User'],
  endpoints: () => ({})
})

export { AuthenticationExpiredError }