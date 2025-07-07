// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React from 'react'

// UI Components
import {
   IconButton,
   Menu,
   MenuButton,
   MenuList,
   MenuItem
} from '@chakra-ui/react'

// Icons
import { PiSlidersHorizontalFill, PiLayout } from 'react-icons/pi'

// Utils
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Settings = () => {
   const { t } = useReactiveTranslation()
   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <Menu isLazy>
         <MenuButton
            as={IconButton}
            icon={<PiSlidersHorizontalFill size={22} />}
            variant='ghost'
            size='sm'
            colorScheme='gray'
         />

         <MenuList>
            <MenuItem icon={<PiLayout size={20} />}>{t('btn-layout')}</MenuItem>
         </MenuList>
      </Menu>
   )
}

// =============================================================================
// EXPORT
// =============================================================================

export default Settings
