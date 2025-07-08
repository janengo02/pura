// =============================================================================
// IMPORTS
// =============================================================================

import React from 'react'
import { useFormContext } from 'react-hook-form'
import {
   FormControl,
   FormErrorMessage,
   FormHelperText,
   FormLabel
} from '@chakra-ui/react'

// Internal Components
import { PasswordInput, TextInput } from './formInput'
import { TextAreaInput } from './formInput/TextAreaInput'

// Utils
import { findInputError, isFormInvalid } from '../utils'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const MultiInput = React.forwardRef(
   (
      {
         name,
         required,
         label,
         variant,
         type,
         placeholder,
         size,
         helpertext,
         validation,
         options,
         ...props
      },
      ref
   ) => {
      // -------------------------------------------------------------------------
      // FORM SETUP
      // -------------------------------------------------------------------------

      const {
         register,
         formState: { errors }
      } = useFormContext()

      const inputErrors = findInputError(errors, name)
      const isInvalid = isFormInvalid(inputErrors)

      // -------------------------------------------------------------------------
      // INPUT TYPE RENDERING
      // -------------------------------------------------------------------------

      const renderInput = () => {
         const commonProps = {
            register,
            name,
            variant,
            placeholder,
            validation,
            onKeyPress: (e) => {
               if (e.key === 'Enter') {
                  e.preventDefault()
                  e.currentTarget.blur()
               }
            },
            ...props
         }

         switch (type) {
            case 'text':
               return (
                  <TextInput
                     {...commonProps}
                     ref={ref}
                     type={type}
                     size={size}
                  />
               )

            case 'textarea':
               return <TextAreaInput {...commonProps} ref={ref} />

            case 'password':
               return <PasswordInput {...commonProps} ref={ref} size={size} />

            default:
               return null
         }
      }

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      return (
         <FormControl isRequired={required} isInvalid={isInvalid}>
            {label && <FormLabel>{label}</FormLabel>}
            {renderInput()}
            {!isInvalid ? (
               <FormHelperText>{helpertext}</FormHelperText>
            ) : (
               <FormErrorMessage>{inputErrors.error.message}</FormErrorMessage>
            )}
         </FormControl>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

MultiInput.displayName = 'MultiInput'
