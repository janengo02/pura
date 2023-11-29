import React from 'react'
import { Button, MenuButton } from '@chakra-ui/react'
import { PiCaretDown } from 'react-icons/pi'
const ControlMenuButton = ({ children, ...props }) => (
   <MenuButton
      as={Button}
      size='sm'
      colorScheme='gray'
      variant='outline'
      borderRadius='full'
      rightIcon={<PiCaretDown size={8} />}
      {...props}
   >
      {children}
   </MenuButton>
)
export default ControlMenuButton
