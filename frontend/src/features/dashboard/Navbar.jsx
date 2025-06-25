// =======================
// Imports
// =======================
import React, { useContext } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

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

import { PiCalendarFill, PiDotsNine, PiFilePlus } from 'react-icons/pi'

import SplitPaneContext from '../../context/SplitPaneContext'
import t from '../../lang/i18n'
import ProfileMenu from './navbar/ProfileMenu'
import Sidebar from './navbar/Sidebar'

// =======================
// Utility Components
// =======================

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

const NavbarLeft = ({ dropdownMenu, sidebar, title }) => (
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
)

const NavbarRight = () => {
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
}

// =======================
// Main Component
// =======================

const Navbar = ({ title }) => {
   const sidebar = useDisclosure()
   const dropdownMenu = useDisclosure()
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
               title={typeof title === 'string' ? title : ''}
            />
            <Spacer />
            <NavbarRight />
         </NavbarWrapper>
      </>
   )
}

// =======================
// PropTypes
// =======================

Navbar.propTypes = {
   title: PropTypes.string
}

// =======================
// Redux
// =======================

const mapStateToProps = (state) => ({
   title: state.page.title
})

// =======================
// Export
// =======================

export default connect(mapStateToProps)(Navbar)
