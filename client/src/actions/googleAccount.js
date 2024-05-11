import { api } from '../utils'
// import { CREATE_GOOGLE_TOKENS } from './types'

// Create Google Account Tokens
export const createGoogleTokens = (reqData) => async () => {
   try {
      await api.post('/google-account/create-tokens', reqData)
   } catch (err) {
      const errors = err.response.data.errors
      console.log(errors)
      //  @Todo Handle error
      // console.clear()
   }
}
