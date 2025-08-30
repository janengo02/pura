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
   ({ addTaskScheduleSlotAction, scheduleData: { task, id } }) => {
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
         // Add 1 hour, but ensure endTime does not cross to the next day
         const nextHour = endTime.getHours() + 1
         if (nextHour < 24) {
            endTime.setHours(nextHour)
         } else {
            // Set to end of the current day (23:59:59.000)
            endTime.setHours(23, 59, 59, 0)
         }

         const formData = {
            pageId: id,
            taskId: task.id,
            task_title: task.title,
            task_content: task.content,
            start: startTime.toISOString(),
            end: endTime.toISOString(),
            slotIndex: task.schedule?.length || 0
         }

         await addTaskScheduleSlotAction(formData)
      }, [
         task.id,
         id,
         addTaskScheduleSlotAction,
         task.schedule?.length,
         task.content,
         task.title
      ])

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      return (
         <Flex w='full' gap={3} alignItems='flex-start' paddingTop={1}>
            <TaskCardLabel
               icon={<PiCalendar size={18} />}
               paddingTop={1}
               text={t('label-schedule')}
            />

            <VStack w='full' alignItems='flex-start' gap={3}>
               {scheduleTimeSlots}

               <Button
                  size='md'
                  colorScheme='gray'
                  onClick={handleAddSlot}
                  opacity={0.3}
                  variant='ghost'
                  leftIcon={<PiPlus size={18} />}
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
      id: PropTypes.string.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectScheduleSelectData = createSelector(
   [(state) => state.task.task, (state) => state.pageSlice.id],
   (task, id) => ({
      task,
      id
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
