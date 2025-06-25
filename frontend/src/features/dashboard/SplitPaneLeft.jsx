// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useContext, useEffect, useCallback } from 'react'

// UI Components
import { Box } from '@chakra-ui/react'

// Context & Hooks
import SplitPaneContext from '../../context/SplitPaneContext'
import useWindowDimensions from '../../hooks/useWindowDimensions'

// Internal Components
import Kanban from './Kanban'
import TaskModal from './kanban/task/TaskModal'

// =============================================================================
// CONSTANTS
// =============================================================================

const HIDE_THRESHOLD = 95
const FULL_WIDTH = 100

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const SplitPaneLeft = React.memo(() => {
   // -------------------------------------------------------------------------
   // HOOKS & CONTEXT
   // -------------------------------------------------------------------------

   const { leftWidth, setLeftWidth, setViewCalendar, leftRef } =
      useContext(SplitPaneContext)
   const { width } = useWindowDimensions()

   // -------------------------------------------------------------------------
   // UTILITY FUNCTIONS
   // -------------------------------------------------------------------------

   const calculateInitialWidth = useCallback(() => {
      if (leftRef.current) {
         const calculatedWidth = (leftRef.current.clientWidth * 100) / width
         setLeftWidth(calculatedWidth)
         leftRef.current.style.flex = 'none'
      }
   }, [leftRef, setLeftWidth, width])

   const handleWidthAdjustment = useCallback(() => {
      if (leftWidth > HIDE_THRESHOLD) {
         setLeftWidth(FULL_WIDTH)
         setViewCalendar(false)
      }

      if (leftRef.current) {
         leftRef.current.style.width = `${leftWidth}%`
      }
   }, [leftWidth, setLeftWidth, setViewCalendar, leftRef])

   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------

   useEffect(() => {
      if (!leftWidth) {
         calculateInitialWidth()
         return
      }

      handleWidthAdjustment()
   }, [
      leftWidth,
      setLeftWidth,
      setViewCalendar,
      width,
      leftRef,
      calculateInitialWidth,
      handleWidthAdjustment
   ])

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <Box ref={leftRef} w='full' h='full' overflow='auto'>
         <Kanban />
         <TaskModal leftWidth={`${leftWidth}%`} />
      </Box>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
SplitPaneLeft.displayName = 'SplitPaneLeft'

// =============================================================================
// EXPORT
// =============================================================================

export default SplitPaneLeft
