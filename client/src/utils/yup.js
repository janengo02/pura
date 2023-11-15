import { setLocale } from 'yup'
import * as yup from 'yup'
import t from '../lang/i18n'

setLocale({
  string: { email: t('yup.email'), min: t('yup.string_min') },
  mixed: { required: t('yup.required') }
})

export default yup
