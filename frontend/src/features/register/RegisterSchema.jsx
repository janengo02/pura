import { yup, notBlank, noSpecialChar } from '../../utils'

export const registerSchema = (t) => {
   return yup.object({
      name: yup
         .string()
         .max(255)
         .required()
         .test(notBlank())
         .test(noSpecialChar()),
      email: yup.string().max(255).email().required(),
      password: yup.string().min(6).max(30),
      confirm_password: yup
         .string()
         .oneOf([yup.ref('password'), null], t('yup-custom-confirm_password'))
   })
}
