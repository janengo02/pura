import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Flex } from '@chakra-ui/react'

// *** Context & hooks ***
import SplitPaneContext from '../../context/SplitPaneContext'
import useWindowDimensions from '../../hooks/useWindowDimensions'

// *** Components ***
import Navbar from './Navbar'
import PageDivider from './PageDivider'
import SplitPaneLeft from './SplitPaneLeft'
import SplitPaneRight from './SplitPaneRight'

// ===================================================================================

const leftRef = React.createRef()
const rightRef = React.createRef()

const Dashboard = () => {
   // ==== States ====
   const [leftWidth, setLeftWidth] = useState(null)
   const [viewCalendar, setViewCalendar] = useState(() => {
      const stored = localStorage.getItem('dashboard.viewCalendar')
      return stored !== null ? stored === 'true' : true
   })
   const [focusDivider, setFocusDivider] = useState(false)
   const separatorXPosition = useRef(null)
   const { width } = useWindowDimensions()

   // ==== Handlers ====
   const onMouseDown = useCallback(
      (e) => {
         separatorXPosition.current = e.clientX
         setFocusDivider(true)
         document.body.style.userSelect = 'none'
         if (leftRef.current) leftRef.current.style.userSelect = 'none'
         if (viewCalendar && rightRef.current)
            rightRef.current.style.userSelect = 'none'
      },
      [viewCalendar]
   )

   const onMouseMove = useCallback(
      (e) => {
         if (!separatorXPosition.current) return
         setLeftWidth((prevLeftWidth) => {
            const newLeftWidth =
               (((prevLeftWidth * width) / 100 +
                  e.clientX -
                  separatorXPosition.current) *
                  100) /
               width
            separatorXPosition.current = e.clientX
            return newLeftWidth
         })
         setFocusDivider(true)
      },
      [width]
   )

   const onMouseUp = useCallback(() => {
      separatorXPosition.current = null
      document.body.style.userSelect = 'auto'
      if (leftRef.current) leftRef.current.style.userSelect = 'auto'
      if (viewCalendar && rightRef.current)
         rightRef.current.style.userSelect = 'auto'
      setFocusDivider(false)
   }, [viewCalendar])

   // ==== Effects ====
   useEffect(() => {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)
      return () => {
         document.removeEventListener('mousemove', onMouseMove)
         document.removeEventListener('mouseup', onMouseUp)
      }
   }, [onMouseMove, onMouseUp])

   useEffect(() => {
      localStorage.setItem('dashboard.viewCalendar', viewCalendar)
   }, [viewCalendar])

   useEffect(() => {
      if (!viewCalendar) {
         setLeftWidth(100)
      } else {
         setLeftWidth(50)
      }
   }, [viewCalendar])

   // ==== Context value ====
   const contextValue = useMemo(
      () => ({
         leftWidth,
         setLeftWidth,
         viewCalendar,
         setViewCalendar,
         onMouseDown,
         focusDivider,
         setFocusDivider,
         leftRef,
         rightRef
      }),
      [
         leftWidth,
         setLeftWidth,
         viewCalendar,
         setViewCalendar,
         onMouseDown,
         focusDivider,
         setFocusDivider
      ]
   )

   // ==== Render ====
   return (
      <Flex flexDirection='column' w='100vw' h='100vh' overflow='hidden'>
         <SplitPaneContext.Provider value={contextValue}>
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
      </Flex>
   )
}

export default Dashboard
