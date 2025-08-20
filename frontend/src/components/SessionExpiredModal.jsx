// =============================================================================
// IMPORTS
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'

// UI Components
import {
   AlertDialog,
   AlertDialogBody,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogContent,
   AlertDialogOverlay,
   Button,
   Icon,
   VStack,
   Text,
   HStack
} from '@chakra-ui/react'
import { MdSecurity } from 'react-icons/md'

// Hooks & Utils
import { useReactiveTranslation } from '../hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const SessionExpiredModal = ({ isOpen, onClose, reason = 'expired' }) => {
   const { t } = useReactiveTranslation()
   const navigate = useNavigate()
   const cancelRef = React.useRef()
   const [countdown, setCountdown] = useState(5)

   // -------------------------------------------------------------------------
   // HANDLERS
   // -------------------------------------------------------------------------

   const handleLoginRedirect = useCallback(() => {
      onClose()
      navigate('/login')
   }, [onClose, navigate])

   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------

   // Auto-redirect countdown
   useEffect(() => {
      if (!isOpen) {
         setCountdown(5) // Reset countdown when modal closes
         return
      }

      if (countdown > 0) {
         const timer = setTimeout(() => {
            setCountdown(countdown - 1)
         }, 1000)
         return () => clearTimeout(timer)
      } else if (countdown === 0) {
         // Auto-redirect when countdown reaches 0
         handleLoginRedirect()
      }
   }, [isOpen, countdown, handleLoginRedirect])

   // Reset countdown when modal opens
   useEffect(() => {
      if (isOpen) {
         setCountdown(5)
      }
   }, [isOpen])

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   const getModalContent = () => {
      switch (reason) {
         case 'expired':
            return {
               title: t('session-expired-title'),
               message: t('session-expired-message'),
               buttonText: t('btn-login')
            }
         case 'invalid':
            return {
               title: t('session-invalid-title'),
               message: t('session-invalid-message'),
               buttonText: t('btn-login')
            }
         case 'revoked':
            return {
               title: t('session-revoked-title'),
               message: t('session-revoked-message'),
               buttonText: t('btn-login')
            }
         default:
            return {
               title: t('session-expired-title'),
               message: t('session-expired-message'),
               buttonText: t('btn-login')
            }
      }
   }

   const { title, message, buttonText } = getModalContent()

   return (
      <AlertDialog
         isOpen={isOpen}
         leastDestructiveRef={cancelRef}
         onClose={onClose}
         isCentered
         closeOnOverlayClick={false}
         closeOnEsc={false}
      >
         <AlertDialogOverlay>
            <AlertDialogContent maxW='400px' mx={4}>
               <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                  <VStack spacing={3} align='center'>
                     <Icon as={MdSecurity} boxSize={8} color='orange.500' />
                     <Text textAlign='center'>{title}</Text>
                  </VStack>
               </AlertDialogHeader>

               <AlertDialogBody>
                  <VStack spacing={3}>
                     <Text textAlign='center' color='gray.600'>
                        {message}
                     </Text>
                     <Text textAlign='center' fontSize='sm' color='gray.500'>
                        {t('session-redirecting-countdown', { count: countdown })}
                     </Text>
                  </VStack>
               </AlertDialogBody>

               <AlertDialogFooter justifyContent='center'>
                  <HStack spacing={3}>
                     <Button
                        ref={cancelRef}
                        colorScheme='blue'
                        onClick={handleLoginRedirect}
                        size='md'
                        minW='120px'
                     >
                        {t('btn-login-now', { buttonText })}
                     </Button>
                  </HStack>
               </AlertDialogFooter>
            </AlertDialogContent>
         </AlertDialogOverlay>
      </AlertDialog>
   )
}

// =============================================================================
// PROP TYPES
// =============================================================================

SessionExpiredModal.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   reason: PropTypes.oneOf(['expired', 'invalid', 'revoked'])
}

// =============================================================================
// EXPORT
// =============================================================================

export default SessionExpiredModal
