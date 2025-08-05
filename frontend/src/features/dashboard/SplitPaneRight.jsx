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
import EventEditModal from './calendar/event/EventEditModal'
import { DIVIDER_WIDTH } from './PageDivider'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const SplitPaneRight = React.memo(() => {
   // -------------------------------------------------------------------------
   // HOOKS & CONTEXT
   // -------------------------------------------------------------------------

   const { leftWidth, rightRef } = useContext(SplitPaneContext)

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <Box ref={rightRef} w='full' h='full' overflow='auto'>
         <Calendar />
         <EventEditModal
            rightWidth={`calc(${100 - leftWidth}% - ${DIVIDER_WIDTH})`}
         />
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
