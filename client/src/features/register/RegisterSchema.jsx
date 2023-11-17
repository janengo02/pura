import { yup, notBlank } from '../../utils'
import t from '../../lang/i18n'

export const registerSchema = yup.object({
   name: yup.string().max(255).required().test(notBlank()),
   email: yup.string().max(255).email().required(),
   password: yup.string().min(6).max(30),
   confirm_password: yup
      .string()
      .oneOf([yup.ref('password'), null], t('yup-custom-confirm_password'))
})
