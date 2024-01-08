import React from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { logout } from '../../../actions/auth'

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
import t from '../../../lang/i18n'

const ProfileMenu = ({ logout, user }) => {
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
               name={user ? user.name : ''}
               w={10}
               h={10}
               bg='gray.300'
               src={user ? user.avatar : 'assets/img/no-avatar.svg'}
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
   logout: PropTypes.func.isRequired,
   user: PropTypes.object
}

const mapStateToProps = (state) => ({
   user: state.auth.user
})

export default connect(mapStateToProps, { logout })(ProfileMenu)
