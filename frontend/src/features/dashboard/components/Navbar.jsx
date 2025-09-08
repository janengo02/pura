// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useContext } from 'react'
import PropTypes from 'prop-types'

// Redux
import { useSelector, useDispatch } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { clearEventEditModal } from '../../event/eventSlice'

// UI Components
import { Flex, Heading, IconButton, Spacer } from '@chakra-ui/react'

// Icons
import { PiCalendarFill } from 'react-icons/pi'

// Internal Components
import ProfileMenu from './ProfileMenu'

// Context & Utils
import SplitPaneContext from '../context/SplitPaneContext'

// Hooks
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'

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
      p={10}
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
const NavbarLeft = React.memo(({ title }) => (
   <Heading as='h2' size='lg' color='text.primary'>
      {title}
   </Heading>
))

NavbarLeft.displayName = 'NavbarLeft'

NavbarLeft.propTypes = {
   title: PropTypes.string.isRequired
}

/**
 * Right section of navbar containing calendar toggle and profile menu
 */
const NavbarRight = React.memo(() => {
   const { viewCalendar, setViewCalendar } = useContext(SplitPaneContext)
   const dispatch = useDispatch()

   return (
      <Flex gap={8}>
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
   // HOOKS & STATE
   // -------------------------------------------------------------------------
   const { t } = useReactiveTranslation()
   const { title } = useSelector(selectNavbarData)

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <>
         <NavbarWrapper>
            <NavbarLeft title={title || t('label-page-title')} />
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
