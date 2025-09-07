// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

// UI Components
import {
   Button,
   Flex,
   Heading,
   HStack,
   VStack,
   Image,
   useColorMode,
   IconButton,
   Collapse,
   Box,
   useBreakpointValue
} from '@chakra-ui/react'

// Icons
import { PiHouseBold, PiList, PiX } from 'react-icons/pi'

// Internal Components
import LanguageSwitcher from '../../ui/components/LanguageSwitcher'
import ThemeToggle from '../../ui/components/ThemeToggle'

// Utils
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Landing page header with navigation
 */
const LandingHeader = React.memo(({ isAuthenticated }) => {
   const navigate = useNavigate()
   const { t } = useReactiveTranslation()
   const { colorMode } = useColorMode()

   // Mobile menu state
   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

   // Responsive values
   const isMobile = useBreakpointValue({ base: true, md: false })
   const logoHeight = useBreakpointValue({ base: '32px', md: '40px' })
   const headerPadding = useBreakpointValue({ base: 4, md: 6 })
   const buttonSize = useBreakpointValue({ base: 'sm', md: 'md' })

   const toggleMobileMenu = () => {
      setIsMobileMenuOpen(!isMobileMenuOpen)
   }

   const authButtons = useMemo(() => {
      const buttonProps = {
         size: buttonSize,
         w: isMobile ? 'full' : 'auto'
      }

      if (isAuthenticated) {
         return (
            <Button
               {...buttonProps}
               colorScheme='purple'
               onClick={() => navigate('/dashboard')}
               leftIcon={<PiHouseBold size={16} />}
            >
               {t('btn-dashboard')}
            </Button>
         )
      }

      return (
         <>
            <Button
               {...buttonProps}
               variant='ghost'
               onClick={() => navigate('/login')}
            >
               {t('landing-demo-login')}
            </Button>
            <Button
               {...buttonProps}
               colorScheme='purple'
               onClick={() => navigate('/register')}
            >
               {t('landing-register')}
            </Button>
         </>
      )
   }, [isAuthenticated, navigate, t, buttonSize, isMobile])

   const desktopNav = (
      <HStack spacing={{ base: 2, md: 4 }}>
         <ThemeToggle asMenuItem={false} />
         <LanguageSwitcher />
         {authButtons}
      </HStack>
   )

   const mobileNav = (
      <VStack spacing={4} align='stretch' p={4}>
         <HStack justifyContent='center' spacing={4}>
            <ThemeToggle asMenuItem={false} />
            <LanguageSwitcher />
         </HStack>
         <VStack spacing={3} align='stretch'>
            {authButtons}
         </VStack>
      </VStack>
   )

   return (
      <Box
         as='header'
         position='sticky'
         top={0}
         bg='bg.canvas'
         borderBottom='1px'
         borderColor='border.default'
         zIndex={10}
         w='full'
      >
         <Flex
            w='full'
            justifyContent='space-between'
            alignItems='center'
            px={headerPadding}
            py={{ base: 3, md: 6 }}
         >
            {/* Logo */}
            <Heading size={{ base: 'sm', md: 'md' }} color='accent.primary'>
               <Image
                  src={
                     colorMode === 'dark'
                        ? '/assets/img/pura-logo-white.svg'
                        : '/assets/img/pura-logo-purple.svg'
                  }
                  alt='Pura Logo'
                  height={logoHeight}
                  cursor='pointer'
                  onClick={() => navigate('/')}
                  loading='eager'
                  fetchPriority='high'
                  transition='opacity 0.2s ease-in-out'
               />
            </Heading>

            {/* Desktop Navigation */}
            {!isMobile && desktopNav}

            {/* Mobile Menu Button */}
            {isMobile && (
               <IconButton
                  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                  icon={isMobileMenuOpen ? <PiX size={20} /> : <PiList size={20} />}
                  variant='ghost'
                  size='md'
                  onClick={toggleMobileMenu}
               />
            )}
         </Flex>

         {/* Mobile Menu Collapse */}
         {isMobile && (
            <Collapse in={isMobileMenuOpen} animateOpacity>
               <Box
                  borderTop='1px'
                  borderColor='border.default'
                  bg='bg.canvas'
               >
                  {mobileNav}
               </Box>
            </Collapse>
         )}
      </Box>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

LandingHeader.displayName = 'LandingHeader'

LandingHeader.propTypes = {
   isAuthenticated: PropTypes.bool
}

// =============================================================================
// EXPORT
// =============================================================================

export default LandingHeader