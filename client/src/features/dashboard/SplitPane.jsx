import React, {
   useState,
   useRef,
   createRef,
   useEffect,
   useContext
} from 'react'
import { Box, Flex, Divider } from '@chakra-ui/react'
import SplitPaneContext from '../../context/SplitPaneContext'
const leftRef = createRef()
const rightRef = createRef()

const SplitPane = ({ children, ...props }) => {
   const [leftWidth, setLeftWidth] = useState(null)
   const [focusDivider, setFocusDivider] = useState(false)
   const separatorXPosition = useRef(null)

   const onMouseDown = (e) => {
      separatorXPosition.current = e.clientX
      setFocusDivider(true)
      // Prevent text selection while resizing
      rightRef.current.style.userSelect = 'none'
      leftRef.current.style.userSelect = 'none'
   }

   const onMouseMove = (e) => {
      if (!separatorXPosition.current) {
         return
      }
      const newLeftWidth = leftWidth + e.clientX - separatorXPosition.current
      separatorXPosition.current = e.clientX
      setLeftWidth(newLeftWidth)
      setFocusDivider(true)
   }

   const onMouseUp = () => {
      separatorXPosition.current = null
      // Enable text selection after resizing
      rightRef.current.style.userSelect = 'auto'
      leftRef.current.style.userSelect = 'auto'
      setFocusDivider(false)
   }

   useEffect(() => {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      return () => {
         document.removeEventListener('mousemove', onMouseMove)
         document.removeEventListener('mouseup', onMouseUp)
      }
   })

   return (
      <Flex w='full' h='full' {...props}>
         <SplitPaneContext.Provider
            value={{
               leftWidth,
               setLeftWidth,
               onMouseDown,
               focusDivider,
               setFocusDivider
            }}
         >
            {children}
         </SplitPaneContext.Provider>
      </Flex>
   )
}

export const PageDivider = () => {
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
      <Divider
         orientation='vertical'
         cursor='col-resize'
         borderWidth={4}
         borderColor={focusDivider ? 'purple.500' : 'gray.200'}
         onMouseDown={onMouseDown}
         ref={dividerRef}
         flexShrink={0}
      />
   )
}
export const SplitPaneLeft = (props) => {
   const { leftWidth, setLeftWidth } = useContext(SplitPaneContext)

   useEffect(() => {
      if (!leftWidth) {
         setLeftWidth(leftRef.current.clientWidth)
         leftRef.current.style.flex = 'none'
         return
      }
      // TODO: Switch to % instead of px
      leftRef.current.style.width = `${leftWidth}px`
   }, [leftWidth, setLeftWidth])

   return (
      <Box w='full' h='full' {...props} ref={leftRef}>
         Kanban board
      </Box>
   )
}
export const SplitPaneRight = (props) => {
   const { leftWidth } = useContext(SplitPaneContext)

   useEffect(() => {
      rightRef.current.style.flex = 'none'
      rightRef.current.style.width = `calc(100vw - ${leftWidth}px)`
   }, [leftWidth])

   return (
      <Box w='full' h='full' {...props} ref={rightRef}>
         Calendar
      </Box>
   )
}
export default SplitPane
