// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'

// UI Components
import {
   Flex,
   Button,
   IconButton,
   Text,
   ButtonGroup,
   Menu,
   MenuButton,
   MenuList,
   MenuItem
} from '@chakra-ui/react'

// Icons
import { PiCaretLeft, PiCaretRight, PiCaretDown } from 'react-icons/pi'

// Utils
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// =============================================================================
// CONSTANTS
// =============================================================================

const VIEW_LABELS = {
   month: 'btn-month',
   week: 'btn-week',
   work_week: 'btn-work-week',
   day: 'btn-day',
   agenda: 'btn-agenda'
}

const BUTTON_STYLES = {
   variant: 'ghost',
   size: 'sm',
   colorScheme: 'gray'
}

const NAVIGATION_BUTTON_STYLES = {
   ...BUTTON_STYLES,
   'aria-label': 'Navigate'
}

const TODAY_BUTTON_STYLES = {
   ...BUTTON_STYLES,
   colorScheme: 'purple'
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatDateRange = (date, view, localizer) => {
   const formats = localizer.formats

   switch (view) {
      case 'month':
         return localizer.format(date, formats.monthHeaderFormat)
      case 'week':
      case 'work_week': {
         const start = localizer.startOf(date, 'week')
         const end = localizer.endOf(date, 'week')
         return `${localizer.format(start, 'MMMM D')} - ${localizer.format(
            end,
            'MMMM D'
         )}`
      }
      case 'day':
         return localizer.format(date, formats.dayHeaderFormat)
      case 'agenda':
         return localizer.format(date, formats.agendaHeaderFormat)
      default:
         return localizer.format(date, 'MMMM YYYY')
   }
}

// =============================================================================
// COMPONENT SECTIONS
// =============================================================================

/**
 * Navigation controls section (left, right, today buttons)
 */
const NavigationControls = React.memo(({ onNavigate, onToday }) => {
   const { t } = useReactiveTranslation()
   return (
      <ButtonGroup size='sm' variant='ghost' colorScheme='gray'>
         <IconButton
            {...NAVIGATION_BUTTON_STYLES}
            icon={<PiCaretLeft />}
            onClick={() => onNavigate('PREV')}
         />
         <Button {...TODAY_BUTTON_STYLES} onClick={onToday}>
            {t('btn-today')}
         </Button>
         <IconButton
            {...NAVIGATION_BUTTON_STYLES}
            icon={<PiCaretRight />}
            onClick={() => onNavigate('NEXT')}
         />
      </ButtonGroup>
   )
})

NavigationControls.displayName = 'NavigationControls'

NavigationControls.propTypes = {
   onNavigate: PropTypes.func.isRequired,
   onToday: PropTypes.func.isRequired
}

/**
 * Date range display section
 */
const DateRangeDisplay = React.memo(({ date, view, localizer }) => {
   const formattedRange = useMemo(
      () => formatDateRange(date, view, localizer),
      [date, view, localizer]
   )

   return (
      <Text
         fontSize='lg'
         fontWeight='semibold'
         color='text.primary'
         minW='200px'
         textAlign='center'
      >
         {formattedRange}
      </Text>
   )
})

DateRangeDisplay.displayName = 'DateRangeDisplay'

DateRangeDisplay.propTypes = {
   date: PropTypes.instanceOf(Date).isRequired,
   view: PropTypes.string.isRequired,
   localizer: PropTypes.object.isRequired
}

/**
 * View selector section
 */
const ViewSelector = React.memo(({ view, views, onView }) => {
   const { t } = useReactiveTranslation()
   const currentViewLabel = useMemo(() => t(VIEW_LABELS[view]), [view, t])

   return (
      <Menu>
         <MenuButton
            as={Button}
            {...BUTTON_STYLES}
            rightIcon={<PiCaretDown />}
            minW='100px'
         >
            {currentViewLabel}
         </MenuButton>
         <MenuList>
            {views.map((viewName) => (
               <MenuItem
                  key={viewName}
                  onClick={() => onView(viewName)}
                  bg={view === viewName ? 'accent.subtle' : 'transparent'}
                  color={view === viewName ? 'accent.primary' : 'text.primary'}
               >
                  {t(VIEW_LABELS[viewName])}
               </MenuItem>
            ))}
         </MenuList>
      </Menu>
   )
})

ViewSelector.displayName = 'ViewSelector'

ViewSelector.propTypes = {
   view: PropTypes.string.isRequired,
   views: PropTypes.array.isRequired,
   onView: PropTypes.func.isRequired
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const CalendarNavigationToolbar = React.memo(
   ({
      // React-Big-Calendar props
      date,
      view,
      views,
      localizer,
      onNavigate,
      onView
   }) => {
      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleToday = useCallback(() => {
         onNavigate('TODAY')
      }, [onNavigate])

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Flex
            w='full'
            alignItems='center'
            justifyContent='space-between'
            bg='bg.surface'
            mb={3}
         >
            {/* Left Section - Navigation Controls */}
            <NavigationControls onNavigate={onNavigate} onToday={handleToday} />

            {/* Center Section - Date Range Display */}
            <DateRangeDisplay date={date} view={view} localizer={localizer} />

            {/* Right Section - View Selector */}
            <ViewSelector view={view} views={views} onView={onView} />
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
CalendarNavigationToolbar.displayName = 'CalendarNavigationToolbar'

// PropTypes validation
CalendarNavigationToolbar.propTypes = {
   // React-Big-Calendar props
   date: PropTypes.instanceOf(Date).isRequired,
   view: PropTypes.string.isRequired,
   views: PropTypes.array.isRequired,
   localizer: PropTypes.object.isRequired,
   onNavigate: PropTypes.func.isRequired,
   onView: PropTypes.func.isRequired
}

// =============================================================================
// EXPORT
// =============================================================================

export default CalendarNavigationToolbar
