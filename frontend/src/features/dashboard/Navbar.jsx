// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useContext, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// UI Components
import {
   Flex,
   Heading,
   IconButton,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Spacer,
   useDisclosure,
   Drawer
} from '@chakra-ui/react'

// Icons
import { PiCalendarFill, PiDotsNine, PiFilePlus } from 'react-icons/pi'

// Internal Components
import ProfileMenu from './navbar/ProfileMenu'
import Sidebar from './navbar/Sidebar'

// Context & Utils
import SplitPaneContext from '../../context/SplitPaneContext'
import t from '../../lang/i18n'

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
const NavbarLeft = React.memo(({ dropdownMenu, sidebar, title }) => (
   <Flex gap={5}>
      <Menu isOpen={dropdownMenu.isOpen} onClose={dropdownMenu.onClose} isLazy>
         <MenuButton
            as={IconButton}
            onClick={() => {
               dropdownMenu.onClose()
               sidebar.onOpen()
            }}
            onMouseEnter={dropdownMenu.onOpen}
            icon={<PiDotsNine size={28} />}
            variant='ghost'
            colorScheme='gray'
         />
         <MenuList
            onMouseEnter={dropdownMenu.onOpen}
            onMouseLeave={dropdownMenu.onClose}
         >
            <MenuItem icon={<PiFilePlus size={20} />}>
               {t('btn-new_page')}
            </MenuItem>
         </MenuList>
      </Menu>
      <Heading as='h3' size='lg' color='gray.600'>
         {title}
      </Heading>
   </Flex>
))

NavbarLeft.displayName = 'NavbarLeft'

NavbarLeft.propTypes = {
   dropdownMenu: PropTypes.shape({
      isOpen: PropTypes.bool.isRequired,
      onClose: PropTypes.func.isRequired,
      onOpen: PropTypes.func.isRequired
   }).isRequired,
   sidebar: PropTypes.shape({
      onOpen: PropTypes.func.isRequired
   }).isRequired,
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

   const sidebar = useDisclosure()
   const dropdownMenu = useDisclosure()

   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------

   const processedTitle = useMemo(() => {
      return typeof title === 'string' ? title : ''
   }, [title])

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <>
         <Drawer
            isOpen={sidebar.isOpen}
            placement='left'
            onClose={sidebar.onClose}
         >
            <Sidebar />
         </Drawer>
         <NavbarWrapper>
            <NavbarLeft
               dropdownMenu={dropdownMenu}
               sidebar={sidebar}
               title={processedTitle}
            />
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
