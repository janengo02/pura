// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { updateFilter } from '../../../../reducers/pageSlice'

// UI Components
import {
   MenuList,
   Menu,
   MenuOptionGroup,
   MenuItemOption,
   MenuGroup,
   Flex,
   Textarea
} from '@chakra-ui/react'
import ResizeTextarea from 'react-textarea-autosize'

// Icons
import { PiCalendar, PiTextTFill } from 'react-icons/pi'

// Internal Components
import { ControlMenuButton } from '../../../../components/CustomMenu'

// Utils
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// Schema

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Filter = React.memo(
   ({ updateFilter, filterData: { filter } }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

      const [nameFilter, setNameFilter] = useState('')
      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const hasNameFilterChanged = useMemo(
         () => typeof nameFilter === 'string' && nameFilter !== filter?.name,
         [nameFilter, filter?.name]
      )
      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------
      const handleNameFilterChange = useCallback((e) => {
         e.preventDefault()
         setNameFilter(e.target.value)
      }, [])

      const handleNameFilterBlur = useCallback((e) => {
         e.preventDefault()
         setNameFilter(e.target.value)
      }, [])
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
            updateFilter({ schedule: newScheduleFilter })
         },
         [filter.schedule, updateFilter]
      )

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Initialize name filter when filter changes
      useEffect(() => {
         if (typeof filter?.name === 'string') {
            setNameFilter(filter?.name)
         }
      }, [filter?.name])

      // Auto-save name filter changes with debounce
      useEffect(() => {
         if (hasNameFilterChanged) {
            const timeoutId = setTimeout(() => {
               updateFilter({ name: nameFilter })
            }, 500)
            return () => clearTimeout(timeoutId)
         }
      }, [hasNameFilterChanged, nameFilter, updateFilter])

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <>
            {/* Name Filter */}
            <Menu isLazy>
               <ControlMenuButton
                  isActive={nameFilter}
                  leftIcon={<PiTextTFill size={18} />}
               >
                  {t('label-name')}
               </ControlMenuButton>
               <MenuList>
                  <MenuGroup title={t('label-name-filter')}>
                     <Flex paddingX={3} alignItems='center'>
                        <Textarea
                           name='title'
                           type='textarea'
                           variant='outline'
                           overflow='hidden'
                           resize='none'
                           p={1}
                           minRows={1}
                           minH='unset'
                           as={ResizeTextarea}
                           value={nameFilter}
                           autoFocus
                           onChange={handleNameFilterChange}
                           onBlur={handleNameFilterBlur}
                        />
                     </Flex>
                  </MenuGroup>
               </MenuList>
            </Menu>

            {/* Schedule Filter */}
            <Menu isLazy>
               <ControlMenuButton
                  leftIcon={<PiCalendar size={18} />}
                  isActive={filter.schedule.length < 2}
               >
                  {t('label-schedule')}
               </ControlMenuButton>
               <MenuList>
                  <MenuOptionGroup
                     defaultValue={filter.schedule || []}
                     title=''
                     fontSize='md'
                     type='checkbox'
                  >
                     <MenuItemOption
                        key='1'
                        value='1'
                        fontSize='md'
                        onClick={(e) => handleScheduleFilter(e, '1')}
                     >
                        {t('schedule_status-true')}
                     </MenuItemOption>
                     <MenuItemOption
                        key='2'
                        value='2'
                        fontSize='md'
                        onClick={(e) => handleScheduleFilter(e, '2')}
                     >
                        {t('schedule_status-false')}
                     </MenuItemOption>
                  </MenuOptionGroup>
               </MenuList>
            </Menu>
         </>
      )
   }
)

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
   updateFilter: PropTypes.func.isRequired
}
// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectFilterSelectData = createSelector(
   [(state) => state.pageSlice.filter],
   (filter) => ({
      filter: filter || {
         schedule: [],
         name: ''
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
   updateFilter
}

// =============================================================================
// EXPORT
// =============================================================================
export default connect(mapStateToProps, mapDispatchToProps)(Filter)
