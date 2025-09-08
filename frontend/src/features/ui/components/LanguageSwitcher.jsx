// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { useSelector, useDispatch } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { changeLanguage } from '../languageSlice'

// UI Components
import {
   Menu,
   MenuButton,
   MenuList,
   MenuOptionGroup,
   MenuItemOption,
   Button,
   Text,
   HStack,
   Box
} from '@chakra-ui/react'

// Utils & Icons
import { PiCaretDown } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'
import { LANGUAGE_OPTIONS } from '../../../shared/constants/languages'

// =============================================================================
// SELECTORS
// =============================================================================

const selectLanguageData = createSelector(
   [(state) => state.language?.current || 'en'],
   (currentLanguage) => ({ currentLanguage })
)

// =============================================================================
// CONSTANTS
// =============================================================================
const BUTTON_STYLES = {
   variant: 'ghost',
   size: 'md',
   colorScheme: 'gray'
}

const MENU_ITEM_STYLES = {
   fontSize: 'md'
}

// =============================================================================
// UTILITY COMPONENTS
// =============================================================================

/**
 * Flag icon component using flag-icons library
 */
const FlagIcon = React.memo(({ countryCode, size = '1.25em' }) => {
   return (
      <Box
         as='span'
         className={`fi fi-${countryCode}`}
         display='inline-block'
         width={size}
         height={size}
         borderRadius='2px'
         boxShadow='0 0 1px rgba(0,0,0,0.2)'
      />
   )
})

FlagIcon.displayName = 'FlagIcon'

FlagIcon.propTypes = {
   countryCode: PropTypes.string.isRequired,
   size: PropTypes.string
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
            <FlagIcon countryCode={currentLangInfo.flagCode} size='1.2em' />
            <Text fontSize='md'>{t(currentLangInfo.labelKey)}</Text>
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
            LANGUAGE_OPTIONS.map(({ value, key, labelKey, flagCode }) => (
               <MenuItemOption
                  key={key}
                  value={value}
                  {...MENU_ITEM_STYLES}
                  onClick={() => onLanguageChange(value)}
               >
                  <HStack spacing={3} align='center'>
                     <FlagIcon countryCode={flagCode} size='1.2em' />
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

const LanguageSwitcher = React.memo(() => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const dispatch = useDispatch()
      const { currentLanguage } = useSelector(selectLanguageData)

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleLanguageChange = useCallback(
         (language) => {
            dispatch(changeLanguage(language))
         },
         [dispatch]
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


LanguageSwitcher.displayName = 'LanguageSwitcher'

// PropTypes validation
LanguageSwitcher.propTypes = {}


// =============================================================================
// EXPORT
// =============================================================================

export default LanguageSwitcher
