import { createRef, useContext, useEffect } from 'react'
import SplitPaneContext from '../../context/SplitPaneContext'
import { Box } from '@chakra-ui/react'

const PageDivider = () => {
   const { onMouseDown, focusDivider, setFocusDivider } =
      useContext(SplitPaneContext)
   const dividerRef = createRef()
   useEffect(() => {
      const dividerNode = dividerRef.current
      let timeout = null
      const startFocusDivider = (event) => {
         if (dividerNode) {
            if (dividerNode.contains(event.target)) {
               // Change divider color after hovering for 0.2s
               timeout = setTimeout(() => setFocusDivider(true), 200)
            } else {
               setFocusDivider(false)
            }
         }
      }
      const removeFocusDivider = () => {
         clearTimeout(timeout)
         setFocusDivider(false)
      }
      dividerNode.addEventListener('mouseover', startFocusDivider)
      dividerNode.addEventListener('mouseout', removeFocusDivider)
      return () => {
         document.removeEventListener('mouseover', startFocusDivider)
      }
   }, [dividerRef, setFocusDivider])
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
