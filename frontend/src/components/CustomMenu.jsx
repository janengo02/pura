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

export const ControlMenuButton = ({ isActive, children, ...props }) => (
   <MenuButton
      as={Button}
      size='sm'
      colorScheme={isActive ? 'purple' : 'gray'}
      color={isActive ? 'accent.primary' : 'text.primary'}
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
      variant='outline'
      rightIcon={<PiCaretDown size={8} />}
      {...props}
   >
      {children}
   </MenuButton>
)
export const DropdownMenu = ({ label, children, ...props }) => (
   <Flex flexDirection='column' gap={1}>
      <Text fontSize='xs' paddingX={1}>
         {label}
      </Text>

      <Menu isLazy {...props}>
         {children}
      </Menu>
   </Flex>
)
export const DropdownMenuList = ({ children, ...props }) => (
   <MenuList minW='fit-content'>{children}</MenuList>
)
