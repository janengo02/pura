import axios from 'axios'
import store from '../store'
import { LOGOUT } from '../actions/types'

// Global session modal handler
let globalSessionHandler = null

export const setGlobalSessionHandler = (handler) => {
   globalSessionHandler = handler
}

// Create an instance of axios
const API_URL = process.env?.REACT_APP_API_URL || 'http://localhost:2000'
const api = axios.create({
   baseURL: `${API_URL}/api`,
   headers: {
      'Content-Type': 'application/json'
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

/*
  NOTE: intercept any error responses from the api
 and check if the token is no longer valid.
 ie. Token has expired or user is no longer
 authenticated.
 Try to refresh the token, or logout if refresh fails
*/

// Add request interceptor to log all outgoing requests
api.interceptors.request.use(
   (config) => {
      return config
   },
   (error) => {
      return Promise.reject(error)
   }
)

api.interceptors.response.use(
   (res) => {
      return res
   },
   async (err) => {
      const originalRequest = err.config
      if (
         err.response?.status === 401 &&
         !originalRequest._retry &&
         !originalRequest.url?.includes('/auth')
      ) {
         // Don't retry refresh requests to avoid infinite loops
         if (isRefreshing) {
            return new Promise((resolve, reject) => {
               failedQueue.push({ resolve, reject })
            })
               .then((token) => {
                  originalRequest.headers['x-auth-token'] = token
                  return api(originalRequest)
               })
               .catch((err) => {
                  return Promise.reject(err)
               })
         }

         originalRequest._retry = true
         isRefreshing = true

         const refreshToken = localStorage.getItem('refreshToken')

         if (refreshToken) {
            try {
               const response = await api.post('/auth/refresh', {
                  refreshToken
               })
               const { token, refreshToken: newRefreshToken } = response.data

               localStorage.setItem('token', token)
               localStorage.setItem('refreshToken', newRefreshToken)
               api.defaults.headers.common['x-auth-token'] = token

               processQueue(null, token)

               originalRequest.headers['x-auth-token'] = token
               return api(originalRequest)
            } catch (refreshError) {
               processQueue(refreshError, null)
               // Determine the reason for failure and show appropriate modal
               let reason = 'expired'
               if (refreshError.response?.data?.msg?.includes('invalid')) {
                  reason = 'invalid'
               } else if (
                  refreshError.response?.data?.msg?.includes('revoked')
               ) {
                  reason = 'revoked'
               }

               localStorage.removeItem('token')
               localStorage.removeItem('refreshToken')

               if (globalSessionHandler) {
                  globalSessionHandler(reason)
               }

               // return api(originalRequest)
               return Promise.reject(refreshError)
            } finally {
               isRefreshing = false
            }
         } else {
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')

            if (globalSessionHandler) {
               globalSessionHandler('invalid')
            }

            return Promise.reject(err)
         }
      }

      return Promise.reject(err)
   }
)

export default api
