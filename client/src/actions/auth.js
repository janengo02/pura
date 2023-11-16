import { api } from "../utils"
import {
   REGISTER_SUCCESS,
   REGISTER_FAIL,
} from "./types"
import { setAlert } from "./alert"

// Register User
export const register = (formData) => async (dispatch) => {
   try {
      const res = await api.post("/users", formData)

      dispatch({
         type: REGISTER_SUCCESS,
         payload: res.data
      })
   } catch (err) {
      const error = err.response.data.error

      if (error) {
        dispatch(setAlert(error.title, error.msg, "error"))
      }

      dispatch({
         type: REGISTER_FAIL
      })
   }
}
