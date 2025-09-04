// =============================================================================
// IMPORTS
// =============================================================================

import React, { useCallback } from 'react'
import { Textarea } from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const TextAreaInput = React.forwardRef((props, forwardedRef) => {
   const { register, name, variant, placeholder, validation, ...restProps } =
      props

   // -------------------------------------------------------------------------
   // REF HANDLING
   // -------------------------------------------------------------------------

   // Combine register ref with forwarded ref
   const { ref: registerRef, ...registerProps } = register(name, validation)

   const setRefs = useCallback(
      (node) => {
         // Set react-hook-form register ref
         registerRef(node)

         // Set forwarded ref (for focus functionality)
         if (typeof forwardedRef === 'function') {
            forwardedRef(node)
         } else if (forwardedRef) {
            forwardedRef.current = node
         }
      },
      [registerRef, forwardedRef]
   )

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

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
         ref={setRefs}
         as={ResizeTextarea}
         {...registerProps}
         {...restProps}
      />
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

TextAreaInput.displayName = 'TextAreaInput'
