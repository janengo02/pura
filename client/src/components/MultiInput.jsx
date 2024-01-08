import { findInputError, isFormInvalid } from '../utils'
import { useFormContext } from 'react-hook-form'
import {
   FormControl,
   FormErrorMessage,
   FormHelperText,
   FormLabel
} from '@chakra-ui/react'
import { PasswordInput, TextInput } from './formInput'

export const MultiInput = ({
   name,
   required,
   label,
   variant,
   type,
   placeholder,
   size,
   helpertext,
   validation,
   ...props
}) => {
   // Set up validation
   const {
      register,
      formState: { errors }
   } = useFormContext()

   const inputErrors = findInputError(errors, name)
   const isInvalid = isFormInvalid(inputErrors)
   // Set up Form Input Type
   let input = null
   switch (type) {
      case 'text':
         input = (
            <TextInput
               register={register}
               name={name}
               variant={variant}
               type={type}
               placeholder={placeholder}
               size={size}
               validation={validation}
               {...props}
            />
         )
         break
      case 'password':
         input = (
            <PasswordInput
               register={register}
               name={name}
               variant={variant}
               size={size}
               validation={validation}
               {...props}
            />
         )
         break
      default:
   }
   return (
      <FormControl isRequired={required} isInvalid={isInvalid}>
         <FormLabel>{label}</FormLabel>
         {input}
         {!isInvalid ? (
            <FormHelperText>{helpertext}</FormHelperText>
         ) : (
            <FormErrorMessage>{inputErrors.error.message}</FormErrorMessage>
         )}
      </FormControl>
   )
}
