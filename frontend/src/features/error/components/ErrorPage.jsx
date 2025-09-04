// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

// Redux
import { useDispatch } from 'react-redux'
import { logout } from '../../auth/authSlice'

// UI Components
import {
   Box,
   Button,
   Container,
   Heading,
   Text,
   VStack,
   HStack,
   Card,
   CardBody,
   Icon,
   Divider,
   Center,
   useColorModeValue
} from '@chakra-ui/react'

// Icons
import { PiWarningCircleBold, PiHouse } from 'react-icons/pi'

// Components & Utils
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ErrorPage = () => {
   // -------------------------------------------------------------------------
   // HOOKS & STATE
   // -------------------------------------------------------------------------

   const { t } = useReactiveTranslation()
   const location = useLocation()
   const navigate = useNavigate()
   const dispatch = useDispatch()

   // Determine if this is a 404 error based on the current path
   const is404 = location.pathname !== '/error'

   const { code, msg } =
      location.state ||
      (is404
         ? { code: '404', msg: 'error-page-not-found' }
         : { code: '500', msg: 'alert-server_error' })

   // -------------------------------------------------------------------------
   // THEME VALUES
   // -------------------------------------------------------------------------

   const bgColor = useColorModeValue('gray.50', 'gray.900')
   const cardBg = useColorModeValue('white', 'gray.800')
   const iconColor = useColorModeValue('red.500', 'red.400')
   const textColor = useColorModeValue('gray.600', 'gray.400')
   const codeColor = useColorModeValue('red.600', 'red.300')

   // -------------------------------------------------------------------------
   // HANDLERS
   // -------------------------------------------------------------------------

   const handleLoginClick = useCallback(() => {
      dispatch(logout())
      navigate('/login')
   }, [dispatch, navigate])

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <Box minH='100vh' bg={bgColor}>
         <Container maxW='container.md' centerContent>
            <Center minH='100vh' w='full'>
               <Card
                  maxW='lg'
                  w='full'
                  bg={cardBg}
                  shadow='xl'
                  borderRadius='xl'
               >
                  <CardBody p={12}>
                     <VStack spacing={8} textAlign='center'>
                        {/* Error Icon */}
                        <Box position='relative'>
                           <Icon
                              as={PiWarningCircleBold}
                              w={20}
                              h={20}
                              color={iconColor}
                              filter='drop-shadow(0 4px 12px rgba(239, 68, 68, 0.3))'
                           />
                        </Box>

                        {/* Error Code */}
                        <VStack spacing={2}>
                           <Text
                              fontSize='6xl'
                              fontWeight='bold'
                              color={codeColor}
                              lineHeight={1}
                              fontFamily='mono'
                           >
                              {code}
                           </Text>
                           <Heading
                              size='lg'
                              color='text.primary'
                              fontWeight='semibold'
                           >
                              {t(msg)}
                           </Heading>
                        </VStack>

                        {/* Description */}
                        <Text
                           color={textColor}
                           fontSize='md'
                           lineHeight={1.6}
                           maxW='sm'
                        >
                           {t(
                              is404
                                 ? 'error-page-not-found-desc'
                                 : 'error-page-description'
                           )}
                        </Text>

                        <Divider />

                        {/* Action Buttons */}
                        <HStack spacing={4} w='full' justify='center'>
                           <Button
                              size='lg'
                              colorScheme='purple'
                              leftIcon={<PiHouse />}
                              minW='150px'
                              onClick={handleLoginClick}
                           >
                              {t('btn-login-page')}
                           </Button>
                        </HStack>
                     </VStack>
                  </CardBody>
               </Card>
            </Center>
         </Container>
      </Box>
   )
}


// =============================================================================
// EXPORT
// =============================================================================

export default ErrorPage
