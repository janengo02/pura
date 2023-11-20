import React, { useState } from 'react'
import {
   Avatar,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   useDisclosure,
   MenuDivider
} from '@chakra-ui/react'
import { PiSignOut, PiGearSix } from 'react-icons/pi'
import t from '../../lang/i18n'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { logout } from '../../actions/auth'

const ProfileMenu = ({ logout }) => {
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
            <MenuItem icon={<PiGearSix size={20} />}>
               {t('btn-account_settings')}
            </MenuItem>
            <MenuDivider />
            <MenuItem icon={<PiSignOut size={20} />} onClick={logout}>
               {t('btn-logout')}
            </MenuItem>
         </MenuList>
      </Menu>
   )
}

ProfileMenu.propTypes = {
   logout: PropTypes.func.isRequired
}

export default connect(null, { logout })(ProfileMenu)
