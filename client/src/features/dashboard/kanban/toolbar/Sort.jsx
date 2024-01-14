import React from 'react'
import { Flex, IconButton, Menu, MenuList, MenuItem } from '@chakra-ui/react'
import {
   PiArrowDown,
   PiTextTFill,
   PiCalendar,
   PiArrowUp,
   PiTrash
} from 'react-icons/pi'
import {
   ControlMenuButton,
   DropdownMenuButton,
   DropdownMenu,
   DropdownMenuList
} from '../../../../components/CustomMenu'
import t from '../../../../lang/i18n'

const Filter = () => {
   return (
      <Menu isLazy>
         <ControlMenuButton leftIcon={<PiArrowDown />}>Name</ControlMenuButton>
         <MenuList>
            <Flex gap={2} paddingX={2} alignItems='flex-end'>
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
               <IconButton
                  variant={'ghost'}
                  color='gray.600'
                  size='sm'
                  icon={<PiTrash />}
               />
            </Flex>
         </MenuList>
      </Menu>
   )
}

export default Filter
