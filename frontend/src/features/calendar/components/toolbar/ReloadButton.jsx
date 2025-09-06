// =============================================================================
// IMPORTS
// =============================================================================

// React
import React, { useCallback } from 'react'

// Redux
import { useSelector } from 'react-redux'
import { createSelector } from 'reselect'

// UI Components
import { IconButton } from '@chakra-ui/react'

// Custom Hooks
import useLoading from '../../../../shared/hooks/useLoading'

// Icons & Actions
import { PiArrowClockwise } from 'react-icons/pi'
import { useLazyLoadCalendarQuery } from '../../api/calendarApi'

// =============================================================================
// SELECTORS
// =============================================================================

const selectReloadButtonData = createSelector(
   [(state) => state.pageSlice.id, (state) => state.calendarSlice.range],
   (pageId, range) => ({ pageId, range })
)


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
      const { pageId, range } = useSelector(selectReloadButtonData)

      // -------------------------------------------------------------------------
      // RTK QUERY HOOKS
      // -------------------------------------------------------------------------
      const [loadCalendar] = useLazyLoadCalendarQuery()

      // -------------------------------------------------------------------------
      // CUSTOM HOOKS
      // -------------------------------------------------------------------------
      const [reloadCalendar, isLoading] = useLoading(async () => {
         if (range && range.length > 0 && pageId) {
            await loadCalendar({
               minDate: range[0],
               maxDate: range[1],
               pageId
            })
         }
      })

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleReloadClick = useCallback(
         async (e) => {
            e.preventDefault()
            await reloadCalendar()
         },
         [reloadCalendar]
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

// =============================================================================
// EXPORT
// =============================================================================

export default ReloadButton
