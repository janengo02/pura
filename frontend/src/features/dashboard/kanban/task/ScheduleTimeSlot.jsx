// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import { updateTaskAction } from '../../../../actions/taskActions'

// UI Components
import { Flex, IconButton, Input } from '@chakra-ui/react'

// External Libraries
import cloneDeep from 'clone-deep'

// Utils & Icons
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import { stringToDateTimeLocal } from '../../../../utils/dates'

// Hooks
import useLoading from '../../../../hooks/useLoading'
import { PiTrash } from 'react-icons/pi'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ScheduleTimeSlot = React.memo(
   ({
      slot,
      index,
      // Redux props
      updateTaskAction,
      scheduleData: { task, pageId }
   }) => {
      // -------------------------------------------------------------------------
      // SCHEDULE UPDATE HANDLERS
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

      const updateScheduleSlot = useCallback(
         async (updateCallback) => {
            const newSchedule = cloneDeep(task.schedule) || []
            updateCallback(newSchedule)

            const formData = {
               page_id: pageId,
               task_id: task._id,
               schedule: newSchedule,
               task_detail_flg: true
            }
            await updateTaskAction(formData)
         },
         [task.schedule, task._id, pageId, updateTaskAction]
      )

      const handleUpdateStartTime = useCallback(
         async (newStartTime) => {
            await updateScheduleSlot((schedule) => {
               schedule[index].start = newStartTime
            })
         },
         [updateScheduleSlot, index]
      )

      const handleUpdateEndTime = useCallback(
         async (newEndTime) => {
            await updateScheduleSlot((schedule) => {
               schedule[index].end = newEndTime
            })
         },
         [updateScheduleSlot, index]
      )

      const handleDeleteSlot = useCallback(async () => {
         await updateScheduleSlot((schedule) => {
            schedule.splice(index, 1)
         })
      }, [updateScheduleSlot, index])

      // -------------------------------------------------------------------------
      // LOADING STATES
      // -------------------------------------------------------------------------

      const [deleteSlot, deleteSlotLoading] = useLoading(handleDeleteSlot)

      // -------------------------------------------------------------------------
      // UI EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleStartTimeChange = useCallback(
         async (e) => {
            e.preventDefault()
            await handleUpdateStartTime(e.target.value)
         },
         [handleUpdateStartTime]
      )

      const handleEndTimeChange = useCallback(
         async (e) => {
            e.preventDefault()
            await handleUpdateEndTime(e.target.value)
         },
         [handleUpdateEndTime]
      )

      const handleDeleteClick = useCallback(
         async (e) => {
            e.preventDefault()
            await deleteSlot()
         },
         [deleteSlot]
      )

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const timeSlotState = useMemo(() => {
         const startTime = stringToDateTimeLocal(slot.start)
         const endTime = stringToDateTimeLocal(slot.end)
         const isViewingCalendarEvent = task.target_event_index === index
         const isInvalidTimeSlot =
            startTime === 'Invalid date' ||
            endTime === 'Invalid date' ||
            startTime >= endTime

         return {
            startTime,
            endTime,
            isViewingCalendarEvent,
            isInvalidTimeSlot
         }
      }, [slot.start, slot.end, task.target_event_index, index])

      const timeInputProps = useMemo(
         () => ({
            size: 'sm',
            type: 'datetime-local',
            variant: 'filled',
            width: 'auto',
            fontSize: 'xs',
            borderRadius: 5
         }),
         []
      )

      const startTimeInput = useMemo(
         () => (
            <Input
               {...timeInputProps}
               bg={
                  timeSlotState.isViewingCalendarEvent
                     ? 'accent.subtle'
                     : 'bg.canvas'
               }
               value={timeSlotState.startTime}
               onChange={handleStartTimeChange}
            />
         ),
         [
            timeInputProps,
            timeSlotState.isViewingCalendarEvent,
            timeSlotState.startTime,
            handleStartTimeChange
         ]
      )

      const endTimeInput = useMemo(
         () => (
            <Input
               {...timeInputProps}
               bg={
                  timeSlotState.isViewingCalendarEvent
                     ? 'accent.subtle'
                     : 'bg.canvas'
               }
               value={timeSlotState.endTime}
               onChange={handleEndTimeChange}
            />
         ),
         [
            timeInputProps,
            timeSlotState.isViewingCalendarEvent,
            timeSlotState.endTime,
            handleEndTimeChange
         ]
      )

      const deleteButton = useMemo(
         () => (
            <IconButton
               icon={<PiTrash size={16} />}
               variant='ghost'
               colorScheme='gray'
               color='text.primary'
               size='sm'
               isLoading={deleteSlotLoading}
               onClick={handleDeleteClick}
            />
         ),
         [deleteSlotLoading, handleDeleteClick]
      )

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      return (
         <Flex
            w='full'
            gap={2}
            color={
               timeSlotState.isInvalidTimeSlot ? 'danger.secondary' : undefined
            }
         >
            {startTimeInput}-{endTimeInput}
            {deleteButton}
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
ScheduleTimeSlot.displayName = 'ScheduleTimeSlot'

// PropTypes validation
ScheduleTimeSlot.propTypes = {
   slot: PropTypes.shape({
      start: PropTypes.string.isRequired,
      end: PropTypes.string.isRequired
   }).isRequired,
   index: PropTypes.number.isRequired,
   updateTaskAction: PropTypes.func.isRequired,
   scheduleData: PropTypes.shape({
      task: PropTypes.object.isRequired,
      pageId: PropTypes.string.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectScheduleData = createSelector(
   [(state) => state.task.task, (state) => state.page._id],
   (task, pageId) => ({
      task,
      pageId
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   scheduleData: selectScheduleData(state)
})

const mapDispatchToProps = {
   updateTaskAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleTimeSlot)
