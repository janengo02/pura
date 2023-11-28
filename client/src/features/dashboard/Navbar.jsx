import React, { useContext } from 'react'

import SplitPaneContext from '../../context/SplitPaneContext'

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
import { PiCalendar, PiDotsNine, PiFilePlus } from 'react-icons/pi'
import t from '../../lang/i18n'

import ProfileMenu from './ProfileMenu'
import Sidebar from './Sidebar'
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
const NavbarLeft = ({ dropdownMenu, sidebar }) => (
   <Flex gap={5}>
      <Menu isOpen={dropdownMenu.isOpen} onClose={dropdownMenu.onClose}>
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
         ></MenuButton>
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
         data.page.title
      </Heading>
   </Flex>
)
const NavbarRight = () => {
   const { viewCalendar, setViewCalendar } = useContext(SplitPaneContext)
   return (
      <Flex gap={8}>
         <IconButton
            isRound={true}
            variant={viewCalendar ? 'solid' : 'outline'}
            colorScheme='purple'
            icon={<PiCalendar size={22} />}
            onClick={() => {
               setViewCalendar((prev) => !prev)
            }}
         />
         <ProfileMenu />
      </Flex>
   )
}
const Navbar = () => {
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
            <NavbarLeft dropdownMenu={dropdownMenu} sidebar={sidebar} />
            <Spacer />
            <NavbarRight />
         </NavbarWrapper>
      </>
   )
}

export default Navbar
