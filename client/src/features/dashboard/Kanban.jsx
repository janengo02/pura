import React from 'react'

import {
   Flex,
   Spacer,
   IconButton,
   Menu,
   MenuButton,
   MenuList,
   MenuItem,
   Button,
   Input,
   Select,
   FormControl,
   FormLabel
} from '@chakra-ui/react'
import {
   PiSlidersHorizontalFill,
   PiLayout,
   PiPlusCircleFill,
   PiArrowDown,
   PiCaretDown
} from 'react-icons/pi'
import t from '../../lang/i18n'

import ControlMenuButton from '../../components/ControlMenuButton'

const Kanban = () => {
   return (
      <Flex
         flexDirection='column'
         w='fit-content'
         h='fit-content'
         minH='full'
         minW='full'
      >
         <Flex w='full' p={5} alignItems='center'>
            <Flex gap={5} alignItems='center'>
               <Menu isLazy>
                  <ControlMenuButton leftIcon={<PiArrowDown />}>
                     Name
                  </ControlMenuButton>
                  <MenuList>
                     <Flex gap={5} paddingX={2} alignItems='center'>
                        <Menu isLazy>
                           <MenuButton
                              as={Button}
                              size='sm'
                              colorScheme='gray'
                              variant='outline'
                              rightIcon={<PiCaretDown size={8} />}
                           >
                              Name
                           </MenuButton>
                           <MenuList>
                              <MenuItem>Name</MenuItem>
                              <MenuItem>Schedule</MenuItem>
                           </MenuList>
                        </Menu>
                     </Flex>
                  </MenuList>
               </Menu>
            </Flex>
            <Spacer />
            <Flex gap={5} alignItems='center'>
               <Menu isLazy>
                  <MenuButton
                     as={IconButton}
                     icon={<PiSlidersHorizontalFill size={22} />}
                     variant='ghost'
                     size='sm'
                     colorScheme='gray'
                  ></MenuButton>
                  <MenuList>
                     <MenuItem icon={<PiLayout size={20} />}>
                        {t('btn-layout')}
                     </MenuItem>
                  </MenuList>
               </Menu>
               <Button
                  size='sm'
                  w='full'
                  colorScheme='purple'
                  leftIcon={<PiPlusCircleFill />}
               >
                  {t('btn-new')}
               </Button>
            </Flex>
         </Flex>
      </Flex>
   )
}

export default Kanban
