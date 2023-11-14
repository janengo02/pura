import * as yup from "yup"

export const registerSchema = yup.object({
   name: yup.string().max(255).required(),
   email: yup.string().max(255).email().required(),
   password: yup.string().min(6).max(30).required(),
   cpassword: yup
      .string()
      .oneof([yup.ref("password"), null], "Passwords must match")
})
