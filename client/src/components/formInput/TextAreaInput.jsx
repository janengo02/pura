import React from 'react'
import { Textarea } from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

export const TextAreaInput = React.forwardRef((props, ref) => {
   const { register, name, variant, placeholder, validation } = props
   return (
      <Textarea
         w='100%'
         p='0'
         minH='unset'
         lineHeight='inherit'
         overflow='hidden'
         resize='none'
         minRows={1}
         variant={variant}
         placeholder={placeholder}
         ref={ref}
         as={ResizeTextarea}
         {...register(name, validation)}
         {...props}
      />
   )
})
