// =============================================================================
// IMPORTS
// =============================================================================

// React
import React, { useCallback } from 'react'

// Redux  
import { useSelector } from 'react-redux'

// UI Components
import { IconButton } from '@chakra-ui/react'

// Icons & Actions
import { PiArrowClockwise } from 'react-icons/pi'
import { useLazyLoadCalendarQuery } from '../../../../api/calendarApi'


// =============================================================================
// CONSTANTS
// =============================================================================

const BUTTON_STYLES = {
   'aria-label': 'Reload Calendar',
   variant: 'ghost',
   size: 'md',
   colorScheme: 'gray',
   color: 'text.primary'
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ReloadButton = React.memo(() => {
      // -------------------------------------------------------------------------
      // REDUX HOOKS
      // -------------------------------------------------------------------------
      const pageId = useSelector((state) => state.pageSlice.id)
      const range = useSelector((state) => state.calendarSlice.range)

      // -------------------------------------------------------------------------
      // RTK QUERY HOOKS
      // -------------------------------------------------------------------------
      const [loadCalendar, {isLoading}] = useLazyLoadCalendarQuery()
      
      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleReloadClick = useCallback(
         async (e) => {
            e.preventDefault()
            if (range && range.length > 0 && pageId) {
               await loadCalendar({
                  minDate: range[0],
                  maxDate: range[1],
                  pageId
               })
            }
         },
         [loadCalendar, range, pageId]
      )

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <IconButton
            {...BUTTON_STYLES}
            icon={<PiArrowClockwise size={18} />}
            onClick={handleReloadClick}
            isLoading={isLoading}
         />
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
ReloadButton.displayName = 'CalendarReloadButton'

// PropTypes validation - now empty since we use hooks
ReloadButton.propTypes = {}

// =============================================================================
// EXPORT
// =============================================================================

export default ReloadButton
