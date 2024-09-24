import React from 'react'
import {
   IconButton,
   Menu,
   MenuButton,
   MenuList,
   MenuItem
} from '@chakra-ui/react'
import { PiSlidersHorizontalFill, PiLayout } from 'react-icons/pi'
import t from '../../../../lang/i18n'

const Settings = () => {
   return (
      <Menu isLazy>
         <MenuButton
            as={IconButton}
            icon={<PiSlidersHorizontalFill size={22} />}
            variant='ghost'
            size='sm'
            colorScheme='gray'
         ></MenuButton>
         <MenuList>
            <MenuItem icon={<PiLayout size={20} />}>{t('btn-layout')}</MenuItem>
         </MenuList>
      </Menu>
   )
}

export default Settings
