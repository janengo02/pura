// =============================================================================
// IMPORTS
// =============================================================================

// React
import React from 'react'

// UI Components
import { Flex } from '@chakra-ui/react'

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
      <Flex
         w='100%'
         paddingY={5}
         paddingX={4}
         justifyContent='end'
      >
         <Flex gap={5} alignItems='flex-start'>
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
