// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { logoutAction } from '../../../actions/authActions'

// UI Components
import {
   Avatar,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   useDisclosure,
   MenuDivider,
   MenuGroup
} from '@chakra-ui/react'

// Utils & Icons
import { PiSignOut, PiGearSix } from 'react-icons/pi'
import t from '../../../lang/i18n'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ProfileMenu = React.memo(({ logoutAction, userData: { user } }) => {
   // -------------------------------------------------------------------------
   // HOOKS & STATE
   // -------------------------------------------------------------------------

   const profileMenu = useDisclosure()

   // -------------------------------------------------------------------------
   // EVENT HANDLERS
   // -------------------------------------------------------------------------

   const handleMenuOpen = useCallback(() => {
      profileMenu.onOpen()
   }, [profileMenu])

   const handleMouseEnter = useCallback(() => {
      profileMenu.onOpen()
   }, [profileMenu])

   const handleMouseLeave = useCallback(() => {
      profileMenu.onClose()
   }, [profileMenu])

   const handleLogout = useCallback(() => {
      logoutAction()
   }, [logoutAction])

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <Menu isOpen={profileMenu.isOpen} onClose={profileMenu.onClose}>
         <MenuButton onClick={handleMenuOpen} onMouseEnter={handleMouseEnter}>
            <Avatar
               name={user?.name || ''}
               w={10}
               h={10}
               bg='gray.300'
               src={user?.avatar || 'assets/img/no-avatar.svg'}
            />
         </MenuButton>
         <MenuList
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
         >
            <MenuGroup title={user ? `Welcome ${user.name}` : 'Welcome'}>
               <MenuItem icon={<PiGearSix size={20} />}>
                  {t('btn-account_settings')}
               </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuItem icon={<PiSignOut size={20} />} onClick={handleLogout}>
               {t('btn-logout')}
            </MenuItem>
         </MenuList>
      </Menu>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

ProfileMenu.displayName = 'ProfileMenu'

ProfileMenu.propTypes = {
   logoutAction: PropTypes.func.isRequired,
   userData: PropTypes.shape({
      user: PropTypes.object
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectUserData = createSelector([(state) => state.auth.user], (user) => ({
   user
}))

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   userData: selectUserData(state)
})

const mapDispatchToProps = {
   logoutAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ProfileMenu)
