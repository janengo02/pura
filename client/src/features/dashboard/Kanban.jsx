import React from 'react'

import {
   Flex,
   Box,
   Spacer,
   IconButton,
   Menu,
   MenuButton,
   MenuList,
   MenuItem
} from '@chakra-ui/react'
import { PiSlidersHorizontalFill, PiLayout } from 'react-icons/pi'
import t from '../../lang/i18n'

const Kanban = () => {
   return (
      <Flex
         flexDirection='column'
         w='fit-content'
         h='fit-content'
         minH='full'
         minW='full'
      >
         <Flex w='full' h={10} p={5} alignItems='center'>
            <Box />
            <Spacer />
            <Flex gap={8}>
               <Menu isLazy>
                  <MenuButton
                     as={IconButton}
                     icon={<PiSlidersHorizontalFill size={22} />}
                     variant='ghost'
                     colorScheme='gray'
                  ></MenuButton>
                  <MenuList>
                     <MenuItem icon={<PiLayout size={20} />}>
                        {t('btn-new_page')}
                     </MenuItem>
                  </MenuList>
               </Menu>
            </Flex>
         </Flex>
      </Flex>
   )
}

export default Kanban
