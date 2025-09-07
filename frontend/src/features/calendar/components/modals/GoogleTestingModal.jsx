// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React from 'react'
import PropTypes from 'prop-types'

// UI Components
import {
   Button,
   Modal,
   ModalOverlay,
   ModalContent,
   ModalHeader,
   ModalFooter,
   ModalBody,
   ModalCloseButton,
   Text,
   VStack,
   Badge
} from '@chakra-ui/react'

// Utils
import { useReactiveTranslation } from '../../../../shared/hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Modal that explains Google Calendar integration is in testing mode
 * and provides options to either request access or proceed with connection
 */
const GoogleTestingModal = React.memo(({
   isOpen,
   onClose,
   onRequestAccess,
   googleLogin
}) => {
   const { t } = useReactiveTranslation()

   const handleGoogleLoginFromModal = () => {
      onClose() // Close modal first
      googleLogin() // Then initiate Google login
   }

   return (
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
         <ModalOverlay />
         <ModalContent>
            <ModalHeader display="flex" alignItems="flex-start" gap={2} flexDirection='column'>
               {t('desc-modal-google-testing-title')}
               <Badge colorScheme="yellow">{t('desc-modal-google-testing-badge')}</Badge>
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
               <VStack spacing={4} align="start">
                  <Text>
                     {t('desc-modal-google-testing-description')}
                  </Text>
                  <Text fontSize="sm" color="text.secondary">
                     {t('desc-modal-google-testing-note')}
                  </Text>
               </VStack>
            </ModalBody>
            <ModalFooter>
               <Button variant="ghost" mr={3} onClick={onRequestAccess}>
                  {t('btn-request-access')}
               </Button>
               <Button colorScheme="blue" onClick={handleGoogleLoginFromModal}>
                  {t('btn-connect-google-calendar')}
               </Button>
            </ModalFooter>
         </ModalContent>
      </Modal>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

GoogleTestingModal.displayName = 'GoogleTestingModal'

GoogleTestingModal.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   onRequestAccess: PropTypes.func.isRequired,
   googleLogin: PropTypes.func.isRequired
}

// =============================================================================
// EXPORT
// =============================================================================

export default GoogleTestingModal