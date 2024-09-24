import { yup } from '../../utils'

export const loginSchema = yup.object({
   email: yup.string().max(255).email().required(),
   password: yup.string().min(6).max(30)
})
