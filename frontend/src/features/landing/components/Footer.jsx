// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React from 'react'
import { useNavigate } from 'react-router-dom'

// UI Components
import {
   Badge,
   Box,
   Container,
   Flex,
   Heading,
   HStack,
   Text,
   VStack
} from '@chakra-ui/react'

// Utils
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Footer section
 */
const Footer = React.memo(() => {
   const { t } = useReactiveTranslation()
   const navigate = useNavigate()

   return (
      <Box
         as='footer'
         bg='bg.canvas'
         py={12}
         borderTop='1px'
         borderColor='border.default'
      >
         <Container maxW='7xl'>
            <VStack spacing={8}>
               <Flex
                  w='full'
                  justifyContent='space-between'
                  alignItems='center'
                  flexDirection={{ base: 'column', md: 'row' }}
                  gap={4}
               >
                  <HStack spacing={2}>
                     <Heading size='md' color='accent.primary'>
                        PURA
                     </Heading>
                     <Badge
                        variant='outline'
                        colorScheme='purple'
                        borderRadius={4}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                     >
                        Demo Application
                     </Badge>
                  </HStack>

                  <VStack
                     spacing={2}
                     align={{ base: 'center', md: 'flex-end' }}
                  >
                     <Text color='text.secondary' fontSize='sm' textAlign='center'>
                        {t('landing-footer-description')}
                     </Text>
                     <HStack spacing={4}>
                        <Text
                           as='button'
                           color='accent.primary'
                           fontSize='sm'
                           cursor='pointer'
                           _hover={{ textDecoration: 'underline' }}
                           onClick={() => navigate('/terms')}
                        >
                           Privacy Policy
                        </Text>
                        <Text color='text.secondary' fontSize='sm'>
                           © 2025 Pura
                        </Text>
                     </HStack>
                  </VStack>
               </Flex>
            </VStack>
         </Container>
      </Box>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

Footer.displayName = 'Footer'

// =============================================================================
// EXPORT
// =============================================================================

export default Footer