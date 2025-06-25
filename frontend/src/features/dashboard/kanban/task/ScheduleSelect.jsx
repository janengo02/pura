// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { updateTaskAction } from '../../../../actions/taskActions'

// External Libraries
import cloneDeep from 'lodash/cloneDeep'

// UI Components
import { Button, Flex, VStack } from '@chakra-ui/react'

// Internal Components
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import ScheduleTimeSlot from './ScheduleTimeSlot'

// Utils & Icons
import { PiCalendar, PiPlus } from 'react-icons/pi'
import t from '../../../../lang/i18n'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ScheduleSelect = React.memo(
   ({ updateTaskAction, scheduleData: { task, _id } }) => {
      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      // Memoize schedule time slots to prevent unnecessary re-renders
      const scheduleTimeSlots = useMemo(() => {
         return (
            task?.schedule?.map((slot, index) => (
               <ScheduleTimeSlot key={index} slot={slot} index={index} />
            )) || []
         )
      }, [task?.schedule])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleAddSlot = useCallback(async () => {
         const newSlot = {
            start: '',
            end: ''
         }

         const newSchedule = cloneDeep(task.schedule)
         newSchedule.push(newSlot)

         const formData = {
            page_id: _id,
            task_id: task._id,
            schedule: newSchedule,
            task_detail_flg: true
         }

         await updateTaskAction(formData)
      }, [task.schedule, task._id, _id, updateTaskAction])

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      return (
         <Flex w='full' gap={3} alignItems='flex-start' paddingTop={1}>
            <TaskCardLabel
               icon={<PiCalendar />}
               paddingTop={1}
               text={t('label-schedule')}
            />

            <VStack w='full' alignItems='flex-start' gap={3}>
               {scheduleTimeSlots}

               <Button
                  size='xs'
                  colorScheme='gray'
                  onClick={handleAddSlot}
                  opacity={0.3}
                  variant='ghost'
                  leftIcon={<PiPlus />}
               >
                  {t('btn-add-schedule')}
               </Button>
            </VStack>
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
ScheduleSelect.displayName = 'ScheduleSelect'

// PropTypes validation
ScheduleSelect.propTypes = {
   updateTaskAction: PropTypes.func.isRequired,
   scheduleData: PropTypes.shape({
      task: PropTypes.object.isRequired,
      _id: PropTypes.string.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectScheduleSelectData = createSelector(
   [(state) => state.task.task, (state) => state.page._id],
   (task, _id) => ({
      task,
      _id
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   scheduleData: selectScheduleSelectData(state)
})

const mapDispatchToProps = {
   updateTaskAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleSelect)
