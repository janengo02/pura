import { baseApi } from './baseApi'
import { removeAllAlerts } from '../reducers/alertSlice'
import { authActionErrorHandler } from '../actions/errorActions'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    loadUser: builder.query({
      query: () => '/auth',
      providesTags: ['Auth']
    }),

    register: builder.mutation({
      query: (formData) => ({
        url: '/users',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        dispatch(removeAllAlerts())
        try {
          const result = await queryFulfilled
          // Trigger loadUser after successful registration
          if (result.data.token) {
            dispatch(authApi.endpoints.loadUser.initiate())
          }
        } catch (err) {
          authActionErrorHandler(dispatch, err)
        }
      }
    }),

    login: builder.mutation({
      query: (formData) => ({
        url: '/auth',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        dispatch(removeAllAlerts())
        try {
          const result = await queryFulfilled
          // Trigger loadUser after successful login
          if (result.data.token) {
            dispatch(authApi.endpoints.loadUser.initiate())
          }
        } catch (err) {
          authActionErrorHandler(dispatch, err)
        }
      }
    })
  })
})

export const {
  useLoadUserQuery,
  useLazyLoadUserQuery,
  useRegisterMutation,
  useLoginMutation
} = authApi