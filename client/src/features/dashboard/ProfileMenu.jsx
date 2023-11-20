import React from 'react'
import {
   Avatar,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   useDisclosure
} from '@chakra-ui/react'
import { PiSignOut } from 'react-icons/pi'
import t from '../../lang/i18n'

const ProfileMenu = () => {
   const profileMenu = useDisclosure()

   return (
      <Menu isOpen={profileMenu.isOpen} onClose={profileMenu.onClose}>
         <MenuButton
            onClick={() => {
               profileMenu.onOpen()
            }}
            onMouseEnter={profileMenu.onOpen}
         >
            <Avatar
               name='Kent Dodds'
               w={10}
               h={10}
               src='https://bit.ly/kent-c-dodds'
            />
         </MenuButton>
         <MenuList
            onMouseEnter={profileMenu.onOpen}
            onMouseLeave={profileMenu.onClose}
         >
            <MenuItem icon={<PiSignOut size={20} />}>
               {t('btn-logout')}
            </MenuItem>
         </MenuList>
      </Menu>
   )
}

export default ProfileMenu
