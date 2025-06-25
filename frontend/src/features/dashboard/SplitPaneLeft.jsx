// *** Imports ***
import React, { useContext, useEffect } from 'react'
import { Box } from '@chakra-ui/react'

// *** Context & hooks ***
import SplitPaneContext from '../../context/SplitPaneContext'
import useWindowDimensions from '../../hooks/useWindowDimensions'

// *** Components ***
import Kanban from './Kanban'
import TaskModal from './kanban/task/TaskModal'

// ===================================================================================

const SplitPaneLeft = React.memo(() => {
   // ==== Context & hooks ====
   const { leftWidth, setLeftWidth, setViewCalendar, leftRef } =
      useContext(SplitPaneContext)
   const { width } = useWindowDimensions()

   // ==== Effects ====
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
   }, [leftWidth, setLeftWidth, setViewCalendar, width, leftRef])

   // ==== Render ====
   return (
      <Box ref={leftRef} w='full' h='full' overflow='auto'>
         <Kanban />
         <TaskModal leftWidth={`${leftWidth}%`} />
      </Box>
   )
})

export default SplitPaneLeft
