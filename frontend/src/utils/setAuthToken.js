import api from "./api"

// store our JWT and refresh token in LS and set axios headers if we do have a token

const setAuthToken = (token, refreshToken) => {
   if (token) {
      api.defaults.headers.common["x-auth-token"] = token
      localStorage.setItem("token", token)
      if (refreshToken) {
         localStorage.setItem("refreshToken", refreshToken)
      }
   } else {
      delete api.defaults.headers.common["x-auth-token"]
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
   }
}

export default setAuthToken