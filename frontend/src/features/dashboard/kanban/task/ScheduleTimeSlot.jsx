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
import { createGoogleEventAction } from '../../../../actions/googleAccountActions'

// UI Components
import {
   Flex,
   IconButton,
   Input,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Tooltip
} from '@chakra-ui/react'

// External Libraries
import cloneDeep from 'clone-deep'

// Utils & Icons
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import { PiCalendarPlusFill, PiTrash } from 'react-icons/pi'
import { stringToDateTimeLocal } from '../../../../utils/dates'

// Hooks
import useLoading from '../../../../hooks/useLoading'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ScheduleTimeSlot = React.memo(
   ({
      slot,
      index,
      // Redux props
      updateTaskAction,
      createGoogleEventAction,
      scheduleData: { task, pageId, googleAccounts }
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
      // GOOGLE CALENDAR HANDLERS
      // -------------------------------------------------------------------------

      const handleCreateGoogleEvent = useCallback(
         async (accountId) => {
            await createGoogleEventAction({
               target_task: task,
               slot_index: index,
               page_id: pageId,
               account_id: accountId
            })
         },
         [createGoogleEventAction, task, index, pageId]
      )

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

      const handleGoogleAccountClick = useCallback(
         (accountId) => async (e) => {
            e.preventDefault()
            await handleCreateGoogleEvent(accountId)
         },
         [handleCreateGoogleEvent]
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

      const googleCalendarMenu = useMemo(
         () => (
            <Tooltip
               hasArrow
               label={t('tooltip-time_slot-view_calendar')}
               placement='bottom'
            >
               <Menu isLazy closeOnSelect={false}>
                  <MenuButton
                     as={IconButton}
                     icon={<PiCalendarPlusFill size={16} />}
                     variant='ghost'
                     colorScheme='gray'
                     color='text.primary'
                     size='sm'
                  />
                  <MenuList zIndex={10}>
                     {googleAccounts.map((account) => (
                        <MenuItem
                           key={account._id}
                           display='flex'
                           justifyContent='space-between'
                           alignItems='center'
                           gap={1}
                           fontSize='xs'
                           onClick={handleGoogleAccountClick(account.accountId)}
                        >
                           {account.accountEmail}
                        </MenuItem>
                     ))}
                  </MenuList>
               </Menu>
            </Tooltip>
         ),
         [googleAccounts, handleGoogleAccountClick, t]
      )

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      return (
         <Flex
            w='full'
            gap={2}
            color={timeSlotState.isInvalidTimeSlot ? 'red.600' : undefined}
         >
            {startTimeInput}-{endTimeInput}
            {deleteButton}
            {googleCalendarMenu}
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
   createGoogleEventAction: PropTypes.func.isRequired,
   scheduleData: PropTypes.shape({
      task: PropTypes.object.isRequired,
      pageId: PropTypes.string.isRequired,
      googleAccounts: PropTypes.array.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectScheduleData = createSelector(
   [
      (state) => state.task.task,
      (state) => state.page._id,
      (state) => state.googleAccount.googleAccounts
   ],
   (task, pageId, googleAccounts) => ({
      task,
      pageId,
      googleAccounts
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   scheduleData: selectScheduleData(state)
})

const mapDispatchToProps = {
   updateTaskAction,
   createGoogleEventAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleTimeSlot)
