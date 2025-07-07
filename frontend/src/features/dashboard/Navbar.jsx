// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useContext } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// UI Components
import { Flex, Heading, IconButton, Spacer } from '@chakra-ui/react'

// Icons
import { PiCalendarFill } from 'react-icons/pi'

// Internal Components
import ProfileMenu from './navbar/ProfileMenu'

// Context & Utils
import SplitPaneContext from '../../context/SplitPaneContext'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

/**
 * Main wrapper component for the navbar layout
 */
const NavbarWrapper = ({ children }) => (
   <Flex
      h={20}
      w='full'
      p={10}
      alignItems='center'
      bg='gray.50'
      borderBottomColor='gray.200'
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
   <Heading as='h3' size='lg' color='gray.600'>
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

   return (
      <Flex gap={8}>
         <IconButton
            isRound
            variant={viewCalendar ? 'solid' : 'outline'}
            colorScheme='purple'
            icon={<PiCalendarFill size={22} />}
            onClick={() => setViewCalendar((prev) => !prev)}
         />
         <ProfileMenu />
      </Flex>
   )
})

NavbarRight.displayName = 'NavbarRight'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Navbar = React.memo(({ title = '' }) => {
   // -------------------------------------------------------------------------
   // HOOKS & STATE
   // -------------------------------------------------------------------------
   const { t } = useReactiveTranslation()

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <>
         <NavbarWrapper>
            <NavbarLeft title={t('label-page-title')} />
            <Spacer />
            <NavbarRight />
         </NavbarWrapper>
      </>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Navbar.displayName = 'Navbar'

// PropTypes validation
Navbar.propTypes = {
   title: PropTypes.string
}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   title: state.page.title
})

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps)(Navbar)
