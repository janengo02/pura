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
import { changeLanguageAction } from '../actions/languageActions'

// UI Components
import {
   Menu,
   MenuButton,
   MenuList,
   MenuOptionGroup,
   MenuItemOption,
   Button,
   Text,
   HStack
} from '@chakra-ui/react'

// Utils & Icons
import { PiCaretDown } from 'react-icons/pi'
import { useReactiveTranslation } from '../hooks/useReactiveTranslation'

// =============================================================================
// CONSTANTS
// =============================================================================

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

const BUTTON_STYLES = {
   variant: 'ghost',
   size: 'sm',
   colorScheme: 'gray'
}

const MENU_ITEM_STYLES = {
   fontSize: 'sm'
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get current language display info
 */
const getCurrentLanguageInfo = (currentLanguage) => {
   return (
      LANGUAGE_OPTIONS.find((lang) => lang.value === currentLanguage) ||
      LANGUAGE_OPTIONS[0]
   )
}

// =============================================================================
// COMPONENT SECTIONS
// =============================================================================

/**
 * Language menu button
 */
const LanguageMenuButton = React.memo(({ currentLanguage }) => {
   const { t } = useReactiveTranslation()
   const currentLangInfo = getCurrentLanguageInfo(currentLanguage)

   return (
      <MenuButton
         as={Button}
         {...BUTTON_STYLES}
         rightIcon={<PiCaretDown size={12} />}
      >
         <HStack spacing={2}>
            <Text fontSize='sm'>{currentLangInfo.flag}</Text>
            <Text fontSize='sm'>{t(currentLangInfo.labelKey)}</Text>
         </HStack>
      </MenuButton>
   )
})

LanguageMenuButton.displayName = 'LanguageMenuButton'

LanguageMenuButton.propTypes = {
   currentLanguage: PropTypes.string.isRequired
}

/**
 * Language menu options
 */
const LanguageMenuOptions = React.memo(
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
                     <Text fontSize='sm'>{flag}</Text>
                     <Text>{t(labelKey)}</Text>
                  </HStack>
               </MenuItemOption>
            )),
         [onLanguageChange, t]
      )

      return (
         <MenuOptionGroup value={currentLanguage} type='radio'>
            {languageMenuItems}
         </MenuOptionGroup>
      )
   }
)

LanguageMenuOptions.displayName = 'LanguageMenuOptions'

LanguageMenuOptions.propTypes = {
   currentLanguage: PropTypes.string.isRequired,
   onLanguageChange: PropTypes.func.isRequired
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const LanguageSwitcher = React.memo(
   ({ changeLanguageAction, languageData: { currentLanguage } }) => {
      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleLanguageChange = useCallback(
         (language) => {
            changeLanguageAction(language)
         },
         [changeLanguageAction]
      )

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      return (
         <Menu>
            <LanguageMenuButton currentLanguage={currentLanguage} />
            <MenuList minW='fit-content'>
               <LanguageMenuOptions
                  currentLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
               />
            </MenuList>
         </Menu>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
LanguageSwitcher.displayName = 'LanguageSwitcher'

// PropTypes validation
LanguageSwitcher.propTypes = {
   changeLanguageAction: PropTypes.func.isRequired,
   languageData: PropTypes.shape({
      currentLanguage: PropTypes.string.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectLanguageData = createSelector(
   [(state) => state.language?.current || 'en'],
   (currentLanguage) => ({ currentLanguage })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   languageData: selectLanguageData(state)
})

const mapDispatchToProps = {
   changeLanguageAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(LanguageSwitcher)
