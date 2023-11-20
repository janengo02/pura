import React from 'react'
import {
   DrawerOverlay,
   DrawerContent,
   DrawerHeader,
   DrawerBody,
   DrawerFooter,
   Input,
   InputGroup,
   InputLeftElement
} from '@chakra-ui/react'
import { PiMagnifyingGlass } from 'react-icons/pi'
import t from '../../lang/i18n'

const Sidebar = () => {
   return (
      <>
         <DrawerOverlay />
         <DrawerContent>
            <DrawerHeader>PURA Ver 0.0.1</DrawerHeader>

            <DrawerBody>
               <InputGroup>
                  <InputLeftElement pointerEvents='none'>
                     <PiMagnifyingGlass color='gray.300' />
                  </InputLeftElement>
                  <Input
                     type='text'
                     placeholder={t('placeholder-search')}
                     variant='filled'
                  />
               </InputGroup>
            </DrawerBody>

            <DrawerFooter></DrawerFooter>
         </DrawerContent>
      </>
   )
}

export default Sidebar
