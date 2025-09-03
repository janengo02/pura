import { baseApi } from './baseApi'
import { commonErrorHandler } from '../reducers/errorHandlerHelpers'

export const googleMeetApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMeetSpace: builder.mutation({
      query: (reqData) => ({
        url: '/google-meet/create-space',
        method: 'POST',
        body: reqData
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
           await queryFulfilled
        } catch (err) {
           // Handle error using common error handler
            commonErrorHandler(dispatch, err)
        }
      }
    })
  })
})

export const {
  useCreateMeetSpaceMutation
} = googleMeetApi