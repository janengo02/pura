// =============================================================================
// IMPORTS
// =============================================================================

// React
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// UI Components
import { IconButton } from '@chakra-ui/react'

// Icons & Actions
import { PiArrowClockwise } from 'react-icons/pi'
import { loadCalendarAction } from '../../../../actions/googleAccountActions'

// Utils
import { firstVisibleDay, lastVisibleDay } from '../../../../utils/dates'

// Hooks
import useLoading from '../../../../hooks/useLoading'

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
// REDUX SELECTORS
// =============================================================================

const selectReloadButtonData = createSelector(
   [(state) => state.page.tasks, (state) => state.googleAccount.range],
   (tasks, range) => ({
      tasks: tasks || [],
      range: range || []
   })
)

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ReloadButton = React.memo(
   ({
      // Redux props
      loadCalendarAction,
      reloadData: { tasks, range }
   }) => {
      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const [handleReload, isLoading] = useLoading(
         useCallback(async () => {
            // Use current range or default range if not available
            const reloadRange =
               range.length > 0
                  ? range
                  : [firstVisibleDay(new Date()), lastVisibleDay(new Date())]

            await loadCalendarAction(reloadRange, tasks)
         }, [loadCalendarAction, range, tasks])
      )

      const handleReloadClick = useCallback(
         async (e) => {
            e.preventDefault()
            await handleReload()
         },
         [handleReload]
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

// PropTypes validation
ReloadButton.propTypes = {
   loadCalendarAction: PropTypes.func.isRequired,
   reloadData: PropTypes.shape({
      tasks: PropTypes.array.isRequired,
      range: PropTypes.array.isRequired
   }).isRequired
}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   reloadData: selectReloadButtonData(state)
})

const mapDispatchToProps = {
   loadCalendarAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ReloadButton)
