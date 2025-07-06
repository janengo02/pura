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
      <Flex
         w='80%'
         minW='45vw'
         paddingY={5}
         paddingLeft={3}
         justifyContent='end'
      >
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
