// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { Flex } from '@chakra-ui/react'

// Context & Hooks
import SplitPaneContext from '../context/SplitPaneContext'
import useWindowDimensions from '../../../shared/hooks/useWindowDimensions'
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'

// Internal Components
import Navbar, { NAVBAR_HEIGHT } from './Navbar'
import PageDivider from './PageDivider'
import SplitPaneLeft from './SplitPaneLeft'
import SplitPaneRight from './SplitPaneRight'
import ToastAlert from '../../../shared/components/errorHandler/ToastAlert'

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = 'dashboard.viewCalendar'
const MIN_LEFT_WIDTH = 30 // Minimum left pane width as percentage
const MAX_LEFT_WIDTH = 70 // Maximum left pane width as percentage

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Dashboard = React.memo(() => {
   const { t } = useReactiveTranslation()
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
            let newLeftWidth = (newWidthPx * 100) / width

            // Apply constraints based on calendar visibility
            if (viewCalendar) {
               // When calendar is visible, constrain between MIN and MAX
               newLeftWidth = Math.max(MIN_LEFT_WIDTH, Math.min(MAX_LEFT_WIDTH, newLeftWidth))
            } else {
               // When calendar is hidden, left pane can go up to 100%
               newLeftWidth = 100
            }

            separatorXPosition.current = e.clientX
            return newLeftWidth
         })
         setFocusDivider(true)
      },
      [width, viewCalendar]
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
      const newWidth = viewCalendar ? 50 : 100
      setLeftWidth(newWidth)
   }, [viewCalendar])

   // Prevent browser back/forward navigation
   useEffect(() => {
      // Push a dummy state to prevent back navigation
      window.history.pushState(null, null, window.location.pathname)

      const handlePopState = () => {
         // Prevent navigation by pushing forward again
         window.history.pushState(null, null, window.location.pathname)
      }

      window.addEventListener('popstate', handlePopState)

      return () => {
         window.removeEventListener('popstate', handlePopState)
      }
   }, [])

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
         aria-label={t('aria-dashboard')}
      >
         <ToastAlert />
         <SplitPaneContext.Provider value={contextValue}>
            <Navbar />
            {layoutContent}
         </SplitPaneContext.Provider>
      </Flex>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

Dashboard.displayName = 'Dashboard'

// =============================================================================
// EXPORT
// =============================================================================

export default Dashboard
