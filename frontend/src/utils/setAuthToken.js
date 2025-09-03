// store our JWT and refresh token in LS

const setAuthToken = (token, refreshToken) => {
   if (token) {
      localStorage.setItem("token", token)
      if (refreshToken) {
         localStorage.setItem("refreshToken", refreshToken)
      }
   } else {
      localStorage.removeItem("token")
      localStorage.removeItem("refreshToken")
   }
}

export default setAuthToken