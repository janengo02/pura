import {
   Alert,
   AlertIcon,
   AlertTitle,
   AlertDescription,
   SlideFade,
   VStack
} from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

const FormAlert = ({ error, ...props }) => {
   const { t } = useReactiveTranslation()

   if (!error) return null

   const errors = error?.data?.errors || []

   if (errors.length > 0) {
      // Handle structured API errors (array of error objects with title/msg)
      return (
         <VStack spacing={2} align="stretch">
            {errors.map((errorItem, index) => (
               <SlideFade in={true} offsetY='-20px' key={index}>
                  <Alert status='error' borderRadius='md' alignItems='flex-start' {...props}>
                     <AlertIcon />
                     <VStack align="start" spacing={1}>
                        {errorItem.title && <AlertTitle>{t(errorItem.title)}</AlertTitle>}
                        <AlertDescription>{t(errorItem.msg)}</AlertDescription>
                     </VStack>
                  </Alert>
               </SlideFade>
            ))}
         </VStack>
      )
   } else {
      // Fallback for non-API errors (single message)
      const message = error?.message || error?.data?.message || 'Operation failed'
      return (
         <SlideFade in={true} offsetY='-20px'>
            <Alert status='error' borderRadius='md' alignItems='flex-start' {...props}>
               <AlertIcon />
               <AlertDescription>{message}</AlertDescription>
            </Alert>
         </SlideFade>
      )
   }
}

FormAlert.propTypes = {
   error: PropTypes.object // RTK Query error object
}

export default FormAlert
