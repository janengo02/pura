import yup from '../../../shared/utils/yup';

export const loginSchema = yup.object({
   email: yup.string().max(255).email().required(),
   password: yup.string().min(6).max(30)
})
