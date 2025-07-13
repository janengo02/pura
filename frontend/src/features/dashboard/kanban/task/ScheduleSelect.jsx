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
import { addTaskScheduleSlotAction } from '../../../../actions/taskActions'

// UI Components
import { Button, Flex, VStack } from '@chakra-ui/react'

// Internal Components
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import ScheduleTimeSlot from './ScheduleTimeSlot'

// Utils & Icons
import { PiCalendar, PiPlus } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ScheduleSelect = React.memo(
   ({ addTaskScheduleSlotAction, scheduleData: { task, _id } }) => {
      const { t } = useReactiveTranslation()
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
         // Create properly formatted timestamps that match Google Calendar format
         const now = new Date()
         const startTime = new Date(now)
         startTime.setSeconds(0, 0) // Set seconds and milliseconds to 0
         
         const endTime = new Date(startTime)
         endTime.setHours(endTime.getHours() + 1) // 1 hour from start time
         
         const formData = {
            page_id: _id,
            task_id: task._id,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            task_detail_flg: true
         }

         await addTaskScheduleSlotAction(formData)
      }, [task._id, _id, addTaskScheduleSlotAction])

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
   addTaskScheduleSlotAction: PropTypes.func.isRequired,
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
   addTaskScheduleSlotAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleSelect)
