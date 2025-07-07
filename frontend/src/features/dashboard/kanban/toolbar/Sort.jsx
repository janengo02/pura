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
         <ControlMenuButton leftIcon={<PiArrowDown />}>Name</ControlMenuButton>

         <MenuList>
            <Flex gap={2} paddingX={2} alignItems='flex-end'>
               {/* Sort By Dropdown */}
               <DropdownMenu label='Sort by'>
                  <DropdownMenuButton leftIcon={<PiTextTFill size={20} />}>
                     Name
                  </DropdownMenuButton>
                  <DropdownMenuList>
                     <MenuItem icon={<PiTextTFill size={20} />}>Name</MenuItem>
                     <MenuItem icon={<PiCalendar size={20} />}>
                        Schedule
                     </MenuItem>
                  </DropdownMenuList>
               </DropdownMenu>

               {/* Order Dropdown */}
               <DropdownMenu label='Order'>
                  <DropdownMenuButton leftIcon={<PiArrowDown size={20} />}>
                     Descending
                  </DropdownMenuButton>
                  <DropdownMenuList>
                     <MenuItem icon={<PiArrowUp size={20} />}>
                        {t('label-ascending')}
                     </MenuItem>
                     <MenuItem icon={<PiArrowDown size={20} />}>
                        {t('label-descending')}
                     </MenuItem>
                  </DropdownMenuList>
               </DropdownMenu>

               {/* Clear Sort Button */}
               <IconButton
                  variant='ghost'
                  color='text.secondary'
                  size='sm'
                  icon={<PiTrash />}
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
