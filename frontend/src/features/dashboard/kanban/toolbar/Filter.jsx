import React from 'react'
import { ControlMenuButton } from '../../../../components/CustomMenu'
import { MenuList, Menu, Button } from '@chakra-ui/react'
import { PiCalendar, PiPlus, PiTextTFill } from 'react-icons/pi'
import t from '../../../../lang/i18n'
const Filter = () => {
   return (
      <>
         <Menu isLazy>
            <ControlMenuButton leftIcon={<PiTextTFill size={20} />}>
               Name
            </ControlMenuButton>
            <MenuList></MenuList>
         </Menu>
         <Menu isLazy>
            <ControlMenuButton leftIcon={<PiCalendar size={20} />}>
               Schedule
            </ControlMenuButton>
            <MenuList></MenuList>
         </Menu>
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

export default Filter
