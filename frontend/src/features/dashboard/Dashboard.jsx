// =============================================================================
// IMPORTS
// =============================================================================

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

// =============================================================================
// CONSTANTS
// =============================================================================

const NAVBAR_HEIGHT = '5rem'
const STORAGE_KEY = 'dashboard.viewCalendar'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Dashboard = React.memo(() => {
   // -------------------------------------------------------------------------
   // STATE & REFS
   // -------------------------------------------------------------------------

   const [leftWidth, setLeftWidth] = useState(null)
   const [viewCalendar, setViewCalendar] = useState(() => {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored !== null ? stored === 'true' : true
   })
   const [focusDivider, setFocusDivider] = useState(false)

   const separatorXPosition = useRef(null)
   const leftRef = useRef(null)
   const rightRef = useRef(null)
   const { width } = useWindowDimensions()

   // -------------------------------------------------------------------------
   // EVENT HANDLERS
   // -------------------------------------------------------------------------

   const onMouseDown = useCallback(
      (e) => {
         separatorXPosition.current = e.clientX
         setFocusDivider(true)

         // Disable text selection during drag
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
            const deltaX = e.clientX - separatorXPosition.current
            const currentWidthPx = (prevLeftWidth * width) / 100
            const newWidthPx = currentWidthPx + deltaX
            const newLeftWidth = (newWidthPx * 100) / width

            separatorXPosition.current = e.clientX
            return newLeftWidth
         })
         setFocusDivider(true)
      },
      [width]
   )

   const onMouseUp = useCallback(() => {
      separatorXPosition.current = null
      setFocusDivider(false)

      // Re-enable text selection
      document.body.style.userSelect = 'auto'
      if (leftRef.current) leftRef.current.style.userSelect = 'auto'
      if (viewCalendar && rightRef.current)
         rightRef.current.style.userSelect = 'auto'
   }, [viewCalendar])

   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------

   // Setup drag event listeners
   useEffect(() => {
      document.addEventListener('mousemove', onMouseMove)
      document.addEventListener('mouseup', onMouseUp)

      return () => {
         document.removeEventListener('mousemove', onMouseMove)
         document.removeEventListener('mouseup', onMouseUp)
      }
   }, [onMouseMove, onMouseUp])

   // Persist calendar view preference
   useEffect(() => {
      localStorage.setItem(STORAGE_KEY, viewCalendar.toString())
   }, [viewCalendar])

   // Update left width based on calendar view
   useEffect(() => {
      setLeftWidth(viewCalendar ? 50 : 100)
   }, [viewCalendar])

   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------

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
      [leftWidth, viewCalendar, onMouseDown, focusDivider]
   )

   const layoutContent = useMemo(
      () => (
         <Flex bg='bg.surface' w='full' h={`calc(100vh - ${NAVBAR_HEIGHT})`}>
            <SplitPaneLeft ref={leftRef} />
            {viewCalendar && (
               <>
                  <PageDivider />
                  <SplitPaneRight ref={rightRef} />
               </>
            )}
         </Flex>
      ),
      [viewCalendar]
   )

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <Flex
         flexDirection='column'
         w='100vw'
         h='100vh'
         overflow='hidden'
         role='main'
         aria-label='Dashboard'
      >
         <SplitPaneContext.Provider value={contextValue}>
            <Navbar />
            {layoutContent}
         </SplitPaneContext.Provider>
      </Flex>
   )
})

Dashboard.displayName = 'Dashboard'

export default Dashboard
