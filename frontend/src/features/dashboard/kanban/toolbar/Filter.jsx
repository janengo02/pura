// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React from 'react'

// UI Components
import { MenuList, Menu, Button } from '@chakra-ui/react'

// Icons
import { PiCalendar, PiPlus, PiTextTFill } from 'react-icons/pi'

// Internal Components
import { ControlMenuButton } from '../../../../components/CustomMenu'

// Utils
import t from '../../../../lang/i18n'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Filter = () => {
   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <>
         {/* Name Filter */}
         <Menu isLazy>
            <ControlMenuButton leftIcon={<PiTextTFill size={20} />}>
               Name
            </ControlMenuButton>
            <MenuList>{/* Filter options can be added here */}</MenuList>
         </Menu>

         {/* Schedule Filter */}
         <Menu isLazy>
            <ControlMenuButton leftIcon={<PiCalendar size={20} />}>
               Schedule
            </ControlMenuButton>
            <MenuList>{/* Filter options can be added here */}</MenuList>
         </Menu>

         {/* Add Filter Button */}
         <Button
            size='sm'
            colorScheme='gray'
            opacity={0.3}
            variant='ghost'
            leftIcon={<PiPlus />}
         >
            {t('btn-add-filter')}
         </Button>
      </>
   )
}

// =============================================================================
// EXPORT
// =============================================================================

export default Filter
