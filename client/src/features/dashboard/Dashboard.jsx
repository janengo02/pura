import React, {
   useState,
   useRef,
   createRef,
   useEffect,
   useContext
} from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import SplitPaneContext from '../../context/SplitPaneContext'
import useWindowDimensions from '../../hooks/useWindowDimensions'

import { Box, Flex } from '@chakra-ui/react'

import Navbar from './Navbar'
import PageDivider from './PageDivider'
import Kanban from './Kanban'
import Calendar from './Calendar'
import TaskModal from './kanban/task/TaskModal'
import { connectGoogle } from '../../actions/googleAccount'

const leftRef = createRef()
const rightRef = createRef()

const SplitPaneLeft = () => {
   const { leftWidth, setLeftWidth, setViewCalendar } =
      useContext(SplitPaneContext)
   const { width } = useWindowDimensions()

   useEffect(() => {
      if (!leftWidth && leftRef.current) {
         setLeftWidth((leftRef.current.clientWidth * 100) / width)
         leftRef.current.style.flex = 'none'
         return
      }
      if (leftWidth > 95) {
         setLeftWidth(100)
         setViewCalendar(false)
      }
      if (leftRef.current) {
         leftRef.current.style.width = `${leftWidth}%`
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [leftWidth])

   return (
      <Box ref={leftRef} w='full' h='full' overflow='auto'>
         <Kanban />
      </Box>
   )
}
const SplitPaneRight = () => (
   <Box ref={rightRef} w='full' h='full' overflow='auto'>
      <Calendar />
   </Box>
)

const Dashboard = ({ connectGoogle }) => {
   const [leftWidth, setLeftWidth] = useState(null)
   const [viewCalendar, setViewCalendar] = useState(true)
   const [focusDivider, setFocusDivider] = useState(false)
   const separatorXPosition = useRef(null)
   const { width } = useWindowDimensions()

   const onMouseDown = (e) => {
      separatorXPosition.current = e.clientX
      setFocusDivider(true)
      // Prevent text selection while resizing
      if (leftRef.current) {
         leftRef.current.style.userSelect = 'none'
      }
      if (viewCalendar && rightRef.current) {
         rightRef.current.style.userSelect = 'none'
      }
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
      if (leftRef.current) {
         leftRef.current.style.userSelect = 'auto'
      }
      if (viewCalendar && rightRef.current) {
         rightRef.current.style.userSelect = 'auto'
      }

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

   useEffect(() => {
      if (!viewCalendar) {
         setLeftWidth(100)
      } else {
         setLeftWidth(50)
      }
   }, [viewCalendar])

   useEffect(() => {
      connectGoogle()
   }, [connectGoogle])

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
            <Flex bg='white' w='full' h='calc(100vh - 81px);'>
               <SplitPaneLeft />
               {viewCalendar && (
                  <>
                     <PageDivider />
                     <SplitPaneRight />
                  </>
               )}
            </Flex>
         </SplitPaneContext.Provider>
         <TaskModal />
      </Flex>
   )
}

Dashboard.propTypes = {
   connectGoogle: PropTypes.func.isRequired
}
export default connect(null, {
   connectGoogle
})(Dashboard)
