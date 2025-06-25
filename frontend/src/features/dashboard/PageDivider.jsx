import { useRef, useContext, useEffect, useCallback } from 'react'
import { Box } from '@chakra-ui/react'

// *** Context & hooks ***
import SplitPaneContext from '../../context/SplitPaneContext'

// ===================================================================================
const PageDivider = () => {
   // ===== Context & Refs =====
   const { onMouseDown, focusDivider, setFocusDivider } =
      useContext(SplitPaneContext)
   const dividerRef = useRef()
   const timeoutRef = useRef(null)

   // ===== Event Handlers =====
   const startFocusDivider = useCallback(
      (event) => {
         const dividerNode = dividerRef.current
         if (dividerNode && dividerNode.contains(event.target)) {
            if (!focusDivider) {
               timeoutRef.current = setTimeout(() => setFocusDivider(true), 200)
            }
         } else {
            if (focusDivider) setFocusDivider(false)
         }
      },
      [focusDivider, setFocusDivider]
   )

   const removeFocusDivider = useCallback(() => {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
      if (focusDivider) setFocusDivider(false)
   }, [focusDivider, setFocusDivider])

   // ===== Effects =====
   useEffect(() => {
      const dividerNode = dividerRef.current
      if (!dividerNode) return
      dividerNode.addEventListener('mouseover', startFocusDivider)
      dividerNode.addEventListener('mouseout', removeFocusDivider)
      return () => {
         dividerNode.removeEventListener('mouseover', startFocusDivider)
         dividerNode.removeEventListener('mouseout', removeFocusDivider)
         clearTimeout(timeoutRef.current)
      }
   }, [startFocusDivider, removeFocusDivider])

   // ===== Render =====
   return (
      <Box
         w={1.5}
         h='full'
         flexShrink={0}
         cursor='col-resize'
         ref={dividerRef}
         bg={focusDivider ? 'purple.500' : 'gray.100'}
         borderWidth={1}
         borderColor={focusDivider ? 'purple.500' : 'white'}
         onMouseDown={onMouseDown}
      />
   )
}

export default PageDivider
