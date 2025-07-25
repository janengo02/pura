// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

// UI Components
import {
   useColorMode,
   Switch,
   Flex,
   Text,
   MenuItem
} from '@chakra-ui/react'

// Utils & Icons
import { PiMoon, PiSun } from 'react-icons/pi'
import { useReactiveTranslation } from '../hooks/useReactiveTranslation'

// =============================================================================
// CONSTANTS
// =============================================================================

const MENU_ITEM_STYLES = {
   fontSize: 'sm'
}

// =============================================================================
// COMPONENT
// =============================================================================

/**
 * Theme toggle component that can be used as a MenuItem or standalone
 */
const ThemeToggle = React.memo(({ onThemeToggle, asMenuItem = true }) => {
   const { t } = useReactiveTranslation()
   const { colorMode, toggleColorMode } = useColorMode()

   const isDark = colorMode === 'dark'

   const handleToggle = useCallback(() => {
      toggleColorMode() // This toggles Chakra's color mode
      if (onThemeToggle) {
         onThemeToggle() // This updates Redux state if provided
      }
   }, [toggleColorMode, onThemeToggle])

   const content = (
      <Flex justify='space-between' align='center' w='full'>
         <Text>{t('label-settings-theme')}</Text>
         <Switch
            isChecked={isDark}
            size='sm'
            colorScheme='purple'
            pointerEvents='none'
         />
      </Flex>
   )

   if (asMenuItem) {
      return (
         <MenuItem
            onClick={handleToggle}
            icon={isDark ? <PiSun size={20} /> : <PiMoon size={20} />}
            {...MENU_ITEM_STYLES}
         >
            {content}
         </MenuItem>
      )
   }

   return (
      <Flex 
         onClick={handleToggle}
         cursor="pointer"
         align="center"
         gap={3}
         p={2}
         borderRadius="md"
         _hover={{ bg: 'gray.100', _dark: { bg: 'gray.700' } }}
      >
         {isDark ? <PiSun size={20} /> : <PiMoon size={20} />}
         {content}
      </Flex>
   )
})

ThemeToggle.displayName = 'ThemeToggle'

ThemeToggle.propTypes = {
   onThemeToggle: PropTypes.func,
   asMenuItem: PropTypes.bool
}

export default ThemeToggle