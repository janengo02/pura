// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { filterSchedule } from '../../../../actions/pageActions'

// UI Components
import {
   MenuList,
   Menu,
   MenuOptionGroup,
   MenuItemOption
} from '@chakra-ui/react'

// Icons
import { PiCalendar, PiTextTFill } from 'react-icons/pi'

// Internal Components
import { ControlMenuButton } from '../../../../components/CustomMenu'

// Utils
import t from '../../../../lang/i18n'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Filter = React.memo(({ filterSchedule, filterData: { filter } }) => {
   // -------------------------------------------------------------------------
   // EVENT HANDLERS
   // -------------------------------------------------------------------------
   const handleScheduleFilter = useCallback(
      (e, value) => {
         e.preventDefault()
         const newScheduleFilter = filter.schedule.slice()
         const index = newScheduleFilter.indexOf(value)
         if (index > -1) {
            newScheduleFilter.splice(index, 1)
         } else {
            newScheduleFilter.push(value)
         }
         filterSchedule(newScheduleFilter)
      },
      [filter.schedule, filterSchedule]
   )

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <>
         {/* Name Filter */}
         <Menu isLazy>
            <ControlMenuButton leftIcon={<PiTextTFill size={20} />}>
               {t('label-name')}
            </ControlMenuButton>
            <MenuList>{/* Filter options can be added here */}</MenuList>
         </Menu>

         {/* Schedule Filter */}
         <Menu isLazy>
            <ControlMenuButton
               leftIcon={<PiCalendar size={20} />}
               isActive={filter.schedule.length < 2}
            >
               {t('label-schedule')}
            </ControlMenuButton>
            <MenuList>
               <MenuOptionGroup
                  defaultValue={filter.schedule || []}
                  title=''
                  fontSize='sm'
                  type='checkbox'
               >
                  <MenuItemOption
                     key='1'
                     value='1'
                     fontSize='sm'
                     onClick={(e) => handleScheduleFilter(e, '1')}
                  >
                     {t('schedule_status-true')}
                  </MenuItemOption>
                  <MenuItemOption
                     key='2'
                     value='2'
                     fontSize='sm'
                     onClick={(e) => handleScheduleFilter(e, '2')}
                  >
                     {t('schedule_status-false')}
                  </MenuItemOption>
               </MenuOptionGroup>
            </MenuList>
         </Menu>
      </>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Filter.displayName = 'KanbanFilter'

// PropTypes validation
Filter.propTypes = {
   filterData: PropTypes.shape({
      filter: PropTypes.object.isRequired
   }).isRequired,
   filterSchedule: PropTypes.func.isRequired
}
// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectFilterSelectData = createSelector(
   [(state) => state.page.filter],
   (filter) => ({
      filter: filter || {
         schedule: [],
         name: {}
      }
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   filterData: selectFilterSelectData(state)
})

const mapDispatchToProps = {
   filterSchedule
}

// =============================================================================
// EXPORT
// =============================================================================
export default connect(mapStateToProps, mapDispatchToProps)(Filter)
