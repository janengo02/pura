// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { logoutAction } from '../../../actions/authActions'
import { changeLanguageAction } from '../../../actions/languageActions'
import { toggleThemeAction } from '../../../actions/themeActions'

// Components
import ThemeToggle from '../../../components/ThemeToggle'

// UI Components
import {
   Avatar,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   MenuDivider,
   MenuOptionGroup,
   MenuItemOption,
   HStack,
   Text,
   useColorMode,
   Switch,
   Flex
} from '@chakra-ui/react'

// Utils & Icons
import { PiSignOut, PiMoon, PiSun } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../hooks/useReactiveTranslation'

// =============================================================================
// CONSTANTS
// =============================================================================

const AVATAR_SIZE = {
   w: 10,
   h: 10
}

const LANGUAGE_OPTIONS = [
   {
      value: 'en',
      key: 'en',
      labelKey: 'label-settings-language-english',
      flag: '🇺🇸'
   },
   {
      value: 'ja',
      key: 'ja',
      labelKey: 'label-settings-language-japanese',
      flag: '🇯🇵'
   }
]

const MENU_ITEM_STYLES = {
   fontSize: 'sm'
}

const DEFAULT_AVATAR = 'assets/img/no-avatar.svg'

// =============================================================================
// COMPONENT SECTIONS
// =============================================================================

/**
 * Avatar button component for the menu trigger
 */
const ProfileAvatar = React.memo(({ user }) => {
   const avatarProps = useMemo(
      () => ({
         name: user?.name || '',
         ...AVATAR_SIZE,
         bg: 'text.muted',
         src: user?.avatar || DEFAULT_AVATAR
      }),
      [user]
   )

   return (
      <MenuButton>
         <Avatar {...avatarProps} />
      </MenuButton>
   )
})

ProfileAvatar.displayName = 'ProfileAvatar'

ProfileAvatar.propTypes = {
   user: PropTypes.object
}


/**
 * Language selection section with Redux state management
 */
const LanguageSelection = React.memo(
   ({ currentLanguage, onLanguageChange }) => {
      const { t } = useReactiveTranslation()

      const languageMenuItems = useMemo(
         () =>
            LANGUAGE_OPTIONS.map(({ value, key, labelKey, flag }) => (
               <MenuItemOption
                  key={key}
                  value={value}
                  {...MENU_ITEM_STYLES}
                  onClick={() => onLanguageChange(value)}
               >
                  <HStack spacing={3}>
                     <Text>{flag}</Text>
                     <Text>{t(labelKey)}</Text>
                  </HStack>
               </MenuItemOption>
            )),
         [onLanguageChange, t]
      )

      return (
         <MenuOptionGroup
            title={t('label-settings-language')}
            value={currentLanguage}
            fontSize='sm'
            type='radio'
         >
            {languageMenuItems}
         </MenuOptionGroup>
      )
   }
)

LanguageSelection.displayName = 'LanguageSelection'

LanguageSelection.propTypes = {
   currentLanguage: PropTypes.string.isRequired,
   onLanguageChange: PropTypes.func.isRequired
}

/**
 * Profile actions section (logout)
 */
const ProfileActions = React.memo(({ onLogout }) => {
   const { t } = useReactiveTranslation()

   const actionItems = useMemo(
      () => [
         {
            icon: <PiSignOut size={20} />,
            label: t('btn-logout'),
            onClick: onLogout,
            key: 'logout'
         }
      ],
      [onLogout, t]
   )

   return (
      <>
         {actionItems.map(({ icon, label, onClick, key }) => (
            <MenuItem key={key} icon={icon} onClick={onClick}>
               {label}
            </MenuItem>
         ))}
      </>
   )
})

ProfileActions.displayName = 'ProfileActions'

ProfileActions.propTypes = {
   onLogout: PropTypes.func.isRequired
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ProfileMenu = React.memo(
   ({
      logoutAction,
      changeLanguageAction,
      toggleThemeAction,
      profileData: { user, currentLanguage }
   }) => {
      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleLogout = useCallback(() => {
         logoutAction()
      }, [logoutAction])

      const handleLanguageChange = useCallback(
         (language) => {
            changeLanguageAction(language)
         },
         [changeLanguageAction]
      )

      const handleThemeToggle = useCallback(() => {
         toggleThemeAction()
      }, [toggleThemeAction])

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      return (
         <Menu>
            <ProfileAvatar user={user} />
            <MenuList>
               <ThemeToggle onThemeToggle={handleThemeToggle} />
               <MenuDivider />
               <LanguageSelection
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
               />
               <MenuDivider />
               <ProfileActions onLogout={handleLogout} />
            </MenuList>
         </Menu>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
ProfileMenu.displayName = 'ProfileMenu'

// PropTypes validation
ProfileMenu.propTypes = {
   logoutAction: PropTypes.func.isRequired,
   changeLanguageAction: PropTypes.func.isRequired,
   toggleThemeAction: PropTypes.func.isRequired,
   profileData: PropTypes.shape({
      user: PropTypes.object,
      currentLanguage: PropTypes.string.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectProfileData = createSelector(
   [(state) => state.auth.user, (state) => state.language.current],
   (user, currentLanguage) => ({
      user,
      currentLanguage
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   profileData: selectProfileData(state)
})

const mapDispatchToProps = {
   logoutAction,
   changeLanguageAction,
   toggleThemeAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ProfileMenu)
