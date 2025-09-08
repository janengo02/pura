// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

// Redux
import { useDispatch } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { clearEventEditModal } from '../../event/eventSlice'

// UI Components
import { Flex, IconButton, Image, Spacer, useBreakpointValue, useColorMode } from '@chakra-ui/react'

// Icons
import { PiCalendarFill } from 'react-icons/pi'
import { FaGithub } from 'react-icons/fa'

// Internal Components
import ProfileMenu from './ProfileMenu'

// Context & Utils
import SplitPaneContext from '../context/SplitPaneContext'

// =============================================================================
// SELECTORS
// =============================================================================

const selectNavbarData = createSelector(
   [(state) => state.pageSlice.title],
   (title) => ({ title })
)

export const NAVBAR_HEIGHT = '5rem'
// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

/**
 * Main wrapper component for the navbar layout
 */
const NavbarWrapper = ({ children }) => (
   <Flex
      h={NAVBAR_HEIGHT}
      w='full'
      p={useBreakpointValue({ base: 4, md: 10 })}
      alignItems='center'
      bg='bg.canvas'
      borderBottomColor='border.default'
      borderBottomWidth={1}
   >
      {children}
   </Flex>
)

NavbarWrapper.propTypes = {
   children: PropTypes.node.isRequired
}

/**
 * Left section of navbar containing menu and title
 */
const NavbarLeft = React.memo(() => {
   const navigate = useNavigate()
   const logoHeight = useBreakpointValue({ base: '32px', md: '40px' })
   const { colorMode } = useColorMode()

   return (
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
)})

NavbarLeft.displayName = 'NavbarLeft'

/**
 * Right section of navbar containing calendar toggle and profile menu
 */
const NavbarRight = React.memo(() => {
   const { viewCalendar, setViewCalendar } = useContext(SplitPaneContext)
   const dispatch = useDispatch()

   return (
      <Flex gap={8}>
         <IconButton
            as='a'
            href='https://github.com/janengo02/pura'
            target='_blank'
            aria-label='View source on GitHub'
            icon={<FaGithub size={20} />}
            variant='ghost'
            isRound
         />
         <IconButton
            isRound
            variant={viewCalendar ? 'solid' : 'outline'}
            colorScheme='purple'
            icon={<PiCalendarFill size={18} />}
            onClick={() => {
               setViewCalendar((prev) => !prev)
               dispatch(clearEventEditModal())
            }}
         />
         <ProfileMenu />
      </Flex>
   )
})

NavbarRight.displayName = 'NavbarRight'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Navbar = React.memo(() => {
   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <>
         <NavbarWrapper>
            <NavbarLeft />
            <Spacer />
            <NavbarRight />
         </NavbarWrapper>
      </>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================


Navbar.displayName = 'Navbar'

// PropTypes validation
Navbar.propTypes = {}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

// =============================================================================
// EXPORT
// =============================================================================

export default Navbar
