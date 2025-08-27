import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { logout } from '../reducers/authSlice'

const baseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token
    if (token) {
      headers.set('x-auth-token', token)
    }
    return headers
  }
})

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)
  
  if (result.error && result.error.status === 401) {
    // Auto-logout on auth failure
    api.dispatch(logout())
  }
  
  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Task', 'Page', 'Calendar'],
  endpoints: () => ({})
})