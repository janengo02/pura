// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React from 'react'

// UI Components
import { Flex, IconButton, Menu, MenuList, MenuItem } from '@chakra-ui/react'

// Icons
import {
   PiArrowDown,
   PiTextTFill,
   PiCalendar,
   PiArrowUp,
   PiTrash
} from 'react-icons/pi'

// Internal Components
import {
   ControlMenuButton,
   DropdownMenuButton,
   DropdownMenu,
   DropdownMenuList
} from '../../../../components/CustomMenu'

// Utils
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Sort = () => {
   const { t } = useReactiveTranslation()
   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <Menu isLazy>
         <ControlMenuButton leftIcon={<PiArrowDown size={18} />}>
            {t('label-sort-name')}
         </ControlMenuButton>

         <MenuList>
            <Flex gap={2} paddingX={2} alignItems='flex-end'>
               {/* Sort By Dropdown */}
               <DropdownMenu label={t('label-sort-by')}>
                  <DropdownMenuButton leftIcon={<PiTextTFill size={18} />}>
                     {t('label-sort-name')}
                  </DropdownMenuButton>
                  <DropdownMenuList>
                     <MenuItem icon={<PiTextTFill size={18} />}>
                        {t('label-sort-name')}
                     </MenuItem>
                     <MenuItem icon={<PiCalendar size={18} />}>
                        {t('label-sort-schedule')}
                     </MenuItem>
                  </DropdownMenuList>
               </DropdownMenu>

               {/* Order Dropdown */}
               <DropdownMenu label={t('label-sort-order')}>
                  <DropdownMenuButton leftIcon={<PiArrowDown size={18} />}>
                     {t('label-sort-descending')}
                  </DropdownMenuButton>
                  <DropdownMenuList>
                     <MenuItem icon={<PiArrowUp size={18} />}>
                        {t('label-ascending')}
                     </MenuItem>
                     <MenuItem icon={<PiArrowDown size={18} />}>
                        {t('label-descending')}
                     </MenuItem>
                  </DropdownMenuList>
               </DropdownMenu>

               {/* Clear Sort Button */}
               <IconButton
                  variant='ghost'
                  color='text.secondary'
                  size='md'
                  icon={<PiTrash size={18} />}
               />
            </Flex>
         </MenuList>
      </Menu>
   )
}

// =============================================================================
// EXPORT
// =============================================================================

export default Sort
