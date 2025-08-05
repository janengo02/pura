// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useContext } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// Actions
import { clearEventEditModalAction } from '../../actions/eventActions'

// UI Components
import { Flex, Heading, IconButton, Spacer } from '@chakra-ui/react'

// Icons
import { PiCalendarFill } from 'react-icons/pi'

// Internal Components
import ProfileMenu from './navbar/ProfileMenu'

// Context & Utils
import SplitPaneContext from '../../context/SplitPaneContext'

// Hooks
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

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
const NavbarRight = React.memo(({ clearEventEditModalAction }) => {
   const { viewCalendar, setViewCalendar } = useContext(SplitPaneContext)

   return (
      <Flex gap={8}>
         <IconButton
            isRound
            variant={viewCalendar ? 'solid' : 'outline'}
            colorScheme='purple'
            icon={<PiCalendarFill size={18} />}
            onClick={() => {
               setViewCalendar((prev) => !prev)
               clearEventEditModalAction()
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

const Navbar = React.memo(({ clearEventEditModalAction }) => {
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
            <NavbarRight
               clearEventEditModalAction={clearEventEditModalAction}
            />
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
   title: PropTypes.string,
   clearEventEditModalAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   title: state.page.title
})

const mapDispatchToProps = {
   clearEventEditModalAction
}
// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Navbar)
