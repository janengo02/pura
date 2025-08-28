import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const API_URL = process.env?.REACT_APP_API_URL || 'http://localhost:2000'

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

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error && result.error.status === 401) {
    // Auto-logout on auth failure - use dynamic import to avoid circular dependency
    const { logout } = await import('../reducers/authSlice')
    api.dispatch(logout())
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Task', 'Page', 'Calendar', 'Auth', 'User'],
  endpoints: () => ({})
})