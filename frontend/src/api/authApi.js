import { baseApi } from './baseApi'

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
    }),

    login: builder.mutation({
      query: (formData) => ({
        url: '/auth',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['Auth'],
    })
  })
})

export const {
  useLoadUserQuery,
  useLazyLoadUserQuery,
  useRegisterMutation,
  useLoginMutation
} = authApi