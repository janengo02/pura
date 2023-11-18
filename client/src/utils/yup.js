import { setLocale } from 'yup'
import * as yup from 'yup'
import t from '../lang/i18n'

setLocale({
   string: {
      email: t('yup-string-email'),
      min: t('yup-string-min'),
      max: t('yup-string-max'),
      length: t('yup-string-length'),
      url: t('yup-string-url'),
      trim: t('yup-string-trim'),
      lowercase: t('yup-string-lowercase'),
      uppercase: t('yup-string-uppercase')
   },
   number: {
      min: t('yup-number-min'),
      max: t('yup-number-max'),
      lessThan: t('yup-number-lessThan'),
      moreThan: t('yup-number-moreThan'),
      notEqual: t('yup-number-notEqual'),
      positive: t('yup-number-positive'),
      negative: t('yup-number-negative'),
      integer: t('yup-number-integer')
   },
   date: {
      min: t('yup-date-min'),
      max: t('yup-date-max')
   },
   mixed: {
      default: t('yup-default'),
      required: t('yup-required')
   }
})

export const notBlank = () => {
   return {
      name: 'not-blank',
      message: t('yup-required'),
      test: (value) =>
         value.replaceAll(' ', '').replaceAll('　', '').length !== 0
   }
}
export const noSpecialChar = () => {
   return {
      name: 'no-special-char',
      message: t('yup-string-noSpecialChar'),
      test: (value) => {
         const specialChar = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
         return !specialChar.test(value)
      }
   }
}
export default yup
