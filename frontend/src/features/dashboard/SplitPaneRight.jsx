// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useContext } from 'react'

// UI Components
import { Box } from '@chakra-ui/react'

// Context
import SplitPaneContext from '../../context/SplitPaneContext'

// Internal Components
import Calendar from './Calendar'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const SplitPaneRight = React.memo(() => {
   // -------------------------------------------------------------------------
   // HOOKS & CONTEXT
   // -------------------------------------------------------------------------

   const { rightRef } = useContext(SplitPaneContext)

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <Box ref={rightRef} w='full' h='full' overflow='auto'>
         <Calendar />
      </Box>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
SplitPaneRight.displayName = 'SplitPaneRight'

// =============================================================================
// EXPORT
// =============================================================================

export default SplitPaneRight
