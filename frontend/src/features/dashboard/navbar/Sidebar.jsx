// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useState, useCallback } from 'react'

// UI Components
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

// Utils & Icons
import { PiMagnifyingGlass } from 'react-icons/pi'
import t from '../../../lang/i18n'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Sidebar = React.memo(() => {
   // -------------------------------------------------------------------------
   // HOOKS & STATE
   // -------------------------------------------------------------------------

   const [searchValue, setSearchValue] = useState('')

   // -------------------------------------------------------------------------
   // EVENT HANDLERS
   // -------------------------------------------------------------------------

   const handleSearchChange = useCallback((e) => {
      setSearchValue(e.target.value)
   }, [])

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

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
                     value={searchValue}
                     onChange={handleSearchChange}
                     placeholder={t('placeholder-search')}
                     variant='filled'
                  />
               </InputGroup>
            </DrawerBody>
            <DrawerFooter></DrawerFooter>
         </DrawerContent>
      </>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

Sidebar.displayName = 'Sidebar'

// =============================================================================
// EXPORT
// =============================================================================

export default Sidebar
