import React, {
   useState,
   useRef,
   createRef,
   useEffect,
   useContext
} from 'react'
import useWindowDimensions from '../../hooks/useWindowDimensions'
import { Box, Flex } from '@chakra-ui/react'
import SplitPaneContext from '../../context/SplitPaneContext'
import Navbar from './Navbar'

const leftRef = createRef()
const rightRef = createRef()

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
         borderWidth={1}
         borderColor={focusDivider ? 'purple.500' : 'white'}
         h='full'
         cursor='col-resize'
         bg={focusDivider ? 'purple.500' : 'gray.100'}
         onMouseDown={onMouseDown}
         ref={dividerRef}
         flexShrink={0}
      />
   )
}
const SplitPaneLeft = (props) => {
   const { leftWidth, setLeftWidth, setViewCalendar } =
      useContext(SplitPaneContext)
   const { width } = useWindowDimensions()

   useEffect(() => {
      if (!leftWidth) {
         setLeftWidth((leftRef.current.clientWidth * 100) / width)
         leftRef.current.style.flex = 'none'
         return
      }
      if (leftWidth > 95) {
         setLeftWidth(100)
         setViewCalendar(false)
      }
      leftRef.current.style.width = `${leftWidth}%`
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [leftWidth])

   return (
      <Box w='full' h='full' {...props} ref={leftRef}>
         Kanban board
      </Box>
   )
}
const SplitPaneRight = (props) => {
   const { leftWidth } = useContext(SplitPaneContext)

   useEffect(() => {
      rightRef.current.style.flex = 'none'
   }, [leftWidth])

   return (
      <Box w='full' h='full' {...props} ref={rightRef}>
         Calendar
      </Box>
   )
}

const SplitPane = () => {
   const [leftWidth, setLeftWidth] = useState(null)
   const [viewCalendar, setViewCalendar] = useState(true)
   const [focusDivider, setFocusDivider] = useState(false)
   const separatorXPosition = useRef(null)
   const { width } = useWindowDimensions()

   const onMouseDown = (e) => {
      separatorXPosition.current = e.clientX
      setFocusDivider(true)
      // Prevent text selection while resizing
      if (viewCalendar) {
         rightRef.current.style.userSelect = 'none'
      }
      leftRef.current.style.userSelect = 'none'
   }

   const onMouseMove = (e) => {
      if (!separatorXPosition.current) {
         return
      }
      const newLeftWidth =
         (((leftWidth * width) / 100 + e.clientX - separatorXPosition.current) *
            100) /
         width
      separatorXPosition.current = e.clientX

      setLeftWidth(newLeftWidth)
      setFocusDivider(true)
   }

   const onMouseUp = () => {
      separatorXPosition.current = null
      // Enable text selection after resizing
      if (viewCalendar) {
         rightRef.current.style.userSelect = 'auto'
      }
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
      <Flex flexDirection='column' w='100vw' h='100vh' overflow='hidden'>
         <SplitPaneContext.Provider
            value={{
               leftWidth,
               setLeftWidth,
               viewCalendar,
               setViewCalendar,
               onMouseDown,
               focusDivider,
               setFocusDivider
            }}
         >
            <Navbar />
            <Flex bg='white' w='full' h='full'>
               <SplitPaneLeft />
               {viewCalendar && (
                  <>
                     <PageDivider />
                     <SplitPaneRight />
                  </>
               )}
            </Flex>
         </SplitPaneContext.Provider>
      </Flex>
   )
}

export default SplitPane
