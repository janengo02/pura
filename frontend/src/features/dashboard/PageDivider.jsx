// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import { useRef, useContext, useEffect, useCallback } from 'react'

// UI Components
import { Box } from '@chakra-ui/react'

// Context
import SplitPaneContext from '../../context/SplitPaneContext'

// =============================================================================
// CONSTANTS
// =============================================================================

const FOCUS_DELAY = 200
const DIVIDER_WIDTH = 1.5

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const PageDivider = () => {
   // -------------------------------------------------------------------------
   // HOOKS & CONTEXT
   // -------------------------------------------------------------------------

   const { onMouseDown, focusDivider, setFocusDivider } =
      useContext(SplitPaneContext)
   const dividerRef = useRef()
   const timeoutRef = useRef(null)

   // -------------------------------------------------------------------------
   // EVENT HANDLERS
   // -------------------------------------------------------------------------

   const handleMouseEnter = useCallback(
      (event) => {
         const dividerNode = dividerRef.current
         if (dividerNode && dividerNode.contains(event.target)) {
            if (!focusDivider) {
               timeoutRef.current = setTimeout(
                  () => setFocusDivider(true),
                  FOCUS_DELAY
               )
            }
         } else {
            if (focusDivider) setFocusDivider(false)
         }
      },
      [focusDivider, setFocusDivider]
   )

   const handleMouseLeave = useCallback(() => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      if (focusDivider) setFocusDivider(false)
   }, [focusDivider, setFocusDivider])

   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------

   useEffect(() => {
      const dividerNode = dividerRef.current
      if (!dividerNode) return

      // Attach event listeners
      dividerNode.addEventListener('mouseover', handleMouseEnter)
      dividerNode.addEventListener('mouseout', handleMouseLeave)

      // Cleanup function
      return () => {
         dividerNode.removeEventListener('mouseover', handleMouseEnter)
         dividerNode.removeEventListener('mouseout', handleMouseLeave)
         clearTimeout(timeoutRef.current)
      }
   }, [handleMouseEnter, handleMouseLeave])

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   return (
      <Box
         w={DIVIDER_WIDTH}
         h='full'
         flexShrink={0}
         cursor='col-resize'
         ref={dividerRef}
         bg={focusDivider ? 'purple.600' : 'gray.100'}
         borderWidth={1}
         borderColor={focusDivider ? 'purple.600' : 'white'}
         onMouseDown={onMouseDown}
      />
   )
}

// =============================================================================
// EXPORT
// =============================================================================

export default PageDivider
