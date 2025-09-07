// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

// Form Handling
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import yup from '../../../../shared/utils/yup'

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
   useToast,
   GridItem,
   SimpleGrid
} from '@chakra-ui/react'

// Internal Components
import { MultiInput } from '../../../../shared/components/formInput/MultiInput'

// API
import { useSubmitTestUserRequestMutation } from '../../api/calendarApi'

// Utils
import { useReactiveTranslation } from '../../../../shared/hooks/useReactiveTranslation'

// =============================================================================
// SCHEMA
// =============================================================================

const emailSubmissionSchema = (t) => {
   return yup.object({
      email: yup.string().max(255).email().required()
   })
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Modal for users to submit their email address to request test access
 * to Google Calendar integration
 */
const EmailSubmissionModal = React.memo(({
   isOpen,
   onClose
}) => {
   const { t } = useReactiveTranslation()
   const toast = useToast()

   const methods = useForm({
      resolver: yupResolver(emailSubmissionSchema(t)),
      defaultValues: {
         email: ''
      }
   })

   const [submitTestUserRequest, { isLoading: isSubmitting }] = useSubmitTestUserRequestMutation()

   const handleEmailSubmit = useCallback(async (data) => {
      try {
         const result = await submitTestUserRequest({ email: data.email })

         if (result.data) {
            toast({
               title: t('desc-success-test-user-request'),
               description: t('desc-success-test-user-request-desc'),
               status: 'success',
               duration: 5000,
               variant: 'solid',
               isClosable: true,
            })

            methods.reset()
            handleEmailModalClose()
         }
      } catch (error) {
         toast({
            title: t('error-test-user-request'),
            description: t('error-test-user-request-desc'),
            status: 'error',
            duration: 3000,
            isClosable: true,
         })
      }
   }, [submitTestUserRequest, toast, t, methods])

   const handleEmailModalClose = useCallback(() => {
      if (!isSubmitting) {
         methods.reset()
         onClose()
      }
   }, [isSubmitting, onClose, methods])

   const handleModalClose = () => {
      if (!isSubmitting) {
         handleEmailModalClose()
      }
   }

   return (
      <Modal isOpen={isOpen} onClose={handleModalClose} isCentered>
         <ModalOverlay />
         <ModalContent>
            <ModalHeader>{t('desc-modal-request-access-title')}</ModalHeader>
            <ModalCloseButton isDisabled={isSubmitting} />
            <ModalBody>
               <FormProvider {...methods}>
                  <form
                     onSubmit={methods.handleSubmit(handleEmailSubmit)}
                     noValidate
                     style={{ width: '100%' }}
                  >
                     <SimpleGrid columns={1} rowGap={4} w='full'>
                        <GridItem colSpan={1}>
                           <Text>
                              {t('desc-modal-request-access-description')}
                           </Text>
                        </GridItem>

                        <GridItem colSpan={1}>
                           <MultiInput
                              name='email'
                              type='text'
                              label={t('label-email-address')}
                              placeholder={t('placeholder-enter-email')}
                              validation={emailSubmissionSchema().fields.email}
                              size='md'
                              required
                              isDisabled={isSubmitting}
                           />
                        </GridItem>
                     </SimpleGrid>
                  </form>
               </FormProvider>
            </ModalBody>
            <ModalFooter>
               <Button
                  variant="ghost"
                  mr={3}
                  onClick={handleModalClose}
                  isDisabled={isSubmitting}
               >
                  {t('btn-cancel')}
               </Button>
               <Button
                  colorScheme="purple"
                  onClick={methods.handleSubmit(handleEmailSubmit)}
                  isLoading={isSubmitting}
                  loadingText={t('btn-submitting')}
               >
                  {t('btn-submit-request')}
               </Button>
            </ModalFooter>
         </ModalContent>
      </Modal>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

EmailSubmissionModal.displayName = 'EmailSubmissionModal'

EmailSubmissionModal.propTypes = {
   isOpen: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired
}

// =============================================================================
// EXPORT
// =============================================================================

export default EmailSubmissionModal