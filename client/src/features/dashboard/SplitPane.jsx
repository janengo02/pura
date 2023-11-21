import React, {
   createContext,
   useState,
   useRef,
   createRef,
   useEffect,
   useContext
} from 'react'
import { Box, Flex, Divider } from '@chakra-ui/react'

const splitPaneContext = createContext()

export default function SplitPane({ children, ...props }) {
   const [leftWidth, setLeftWidth] = useState(null)
   const separatorXPosition = useRef(null)

   const onMouseDown = (e) => {
      separatorXPosition.current = e.clientX
   }

   const onMouseMove = (e) => {
      if (!separatorXPosition.current) {
         return
      }

      const newLeftWidth = leftWidth + e.clientX - separatorXPosition.current
      separatorXPosition.current = e.clientX

      setLeftWidth(newLeftWidth)
   }

   const onMouseUp = () => {
      separatorXPosition.current = null
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
         <splitPaneContext.Provider value={{ leftWidth, setLeftWidth }}>
            {children[0]}

            <Divider
               orientation='vertical'
               w={3}
               bg='gray.200'
               cursor='col-resize'
               border='none'
               onMouseDown={onMouseDown}
            />
            {children[1]}
         </splitPaneContext.Provider>
      </Flex>
   )
}

SplitPane.Left = function SplitPaneLeft(props) {
   const leftRef = createRef()
   const { leftWidth, setLeftWidth } = useContext(splitPaneContext)

   useEffect(() => {
      if (!leftWidth) {
         setLeftWidth(leftRef.current.clientWidth)
         leftRef.current.style.flex = 'none'
         return
      }

      leftRef.current.style.width = `${leftWidth}px`
   }, [leftRef, leftWidth, setLeftWidth])

   return (
      <Box w='full' h='full' {...props} ref={leftRef}>
         heelo
      </Box>
   )
}

SplitPane.Right = function SplitPaneRight(props) {
   return (
      <Box w='full' h='full' {...props}>
         Hello
      </Box>
   )
}
