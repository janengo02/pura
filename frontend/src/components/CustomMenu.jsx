import React from 'react'
import {
   Button,
   Flex,
   Menu,
   MenuButton,
   MenuList,
   Text
} from '@chakra-ui/react'
import { PiCaretDown } from 'react-icons/pi'

export const ControlMenuButton = ({ children, ...props }) => (
   <MenuButton
      as={Button}
      size='sm'
      colorScheme='gray'
      color='gray.600'
      variant='outline'
      borderRadius='full'
      rightIcon={<PiCaretDown size={8} />}
      {...props}
   >
      {children}
   </MenuButton>
)
export const DropdownMenuButton = ({ children, ...props }) => (
   <MenuButton
      as={Button}
      size='sm'
      colorScheme='gray'
      color='gray.600'
      variant='outline'
      rightIcon={<PiCaretDown size={8} />}
      {...props}
   >
      {children}
   </MenuButton>
)
export const DropdownMenu = ({ label, children, ...props }) => (
   <Flex flexDirection='column' gap={1}>
      <Text fontSize='xs' paddingX={1} color='gray.600'>
         {label}
      </Text>

      <Menu isLazy {...props}>
         {children}
      </Menu>
   </Flex>
)
export const DropdownMenuList = ({ children, ...props }) => (
   <MenuList minW='fit-content' color='gray.600'>
      {children}
   </MenuList>
)
