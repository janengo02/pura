// =============================================================================
// IMPORTS
// =============================================================================

// React
import React from 'react'

// UI Components
import { Flex, Spacer } from '@chakra-ui/react'

// Internal Components
import Settings from './Settings'
import ReloadButton from './ReloadButton'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Toolbar = React.memo(() => {
   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <Flex w='full' maxW={802} paddingY={5} paddingX={3} alignItems='center'>
         <Flex gap={2} alignItems='center'>
            {/* Left side actions - currently empty */}
         </Flex>

         <Spacer w={5} />

         <Flex gap={5} alignItems='center'>
            <ReloadButton />
            <Settings />
         </Flex>
      </Flex>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Toolbar.displayName = 'CalendarToolbar'

// =============================================================================
// EXPORT
// =============================================================================

export default Toolbar
