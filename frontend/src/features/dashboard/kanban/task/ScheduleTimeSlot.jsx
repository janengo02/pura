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
import {
   updateTaskScheduleAction,
   removeTaskScheduleSlotAction,
   syncTaskWithGoogleAction
} from '../../../../actions/taskActions'

// UI Components
import {
   Flex,
   IconButton,
   Input,
   Button,
   Menu,
   MenuButton,
   MenuList,
   MenuOptionGroup,
   MenuItemOption,
   Text,
   Badge,
   HStack,
   Divider,
   MenuItem,
   VStack
} from '@chakra-ui/react'

// Utils & Icons
import { stringToDateTimeLocal } from '../../../../utils/dates'

// Hooks
import useLoading from '../../../../hooks/useLoading'
import { PiTrash, PiCloudArrowUp, PiCalendarCheck } from 'react-icons/pi'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '@pura/shared'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ScheduleTimeSlot = React.memo(
   ({
      slot,
      index,
      // Redux props
      updateTaskScheduleAction,
      removeTaskScheduleSlotAction,
      syncTaskWithGoogleAction,
      scheduleData: { task, pageId },
      googleData: { googleAccounts, googleCalendars }
   }) => {
      // -------------------------------------------------------------------------
      // SCHEDULE UPDATE HANDLERS
      // -------------------------------------------------------------------------
      // Note: t is available for future i18n implementation
      // const { t } = useReactiveTranslation()

      const updateScheduleSlot = useCallback(
         async (updates) => {
            const formData = {
               page_id: pageId,
               task_id: task._id,
               slot_index: index,
               task_detail_flg: true,
               ...updates
            }
            await updateTaskScheduleAction(formData)
         },
         [updateTaskScheduleAction, pageId, task._id, index]
      )

      const handleDeleteSlot = useCallback(async () => {
         const formData = {
            page_id: pageId,
            task_id: task._id,
            slot_index: index,
            task_detail_flg: true
         }
         await removeTaskScheduleSlotAction(formData)
      }, [removeTaskScheduleSlotAction, index, pageId, task._id])

      // -------------------------------------------------------------------------
      // SYNC HANDLERS
      // -------------------------------------------------------------------------

      const handleSyncWithGoogle = useCallback(
         async (args) => {
            // Handle args array from useLoading hook
            const [accountId, calendarId] = args
            const reqData = {
               task_id: task._id,
               slot_index: index,
               account_id: accountId,
               calendar_id: calendarId,
               sync_action: 'create'
            }
            await syncTaskWithGoogleAction(reqData)
         },
         [task._id, index, syncTaskWithGoogleAction]
      )

      // -------------------------------------------------------------------------
      // LOADING STATES
      // -------------------------------------------------------------------------

      const [deleteSlot, deleteSlotLoading] = useLoading(handleDeleteSlot)
      const [syncWithGoogle, syncLoading] = useLoading(handleSyncWithGoogle)

      // -------------------------------------------------------------------------
      // UI EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleStartTimeChange = useCallback(
         async (e) => {
            e.preventDefault()
            const newStartTime = new Date(e.target.value)
            newStartTime.setSeconds(0, 0) // Set seconds and milliseconds to 0

            const currentEndTime = new Date(slot.end)

            // Validate: if new start time is equal or later than end time
            if (newStartTime >= currentEndTime) {
               // Auto-correct: set end time to 1 hour after new start time
               const correctedEndTime = new Date(newStartTime)
               correctedEndTime.setHours(correctedEndTime.getHours() + 1)

               // Update both start and end times
               await updateScheduleSlot({
                  start: newStartTime.toISOString(),
                  end: correctedEndTime.toISOString()
               })
            } else {
               // Only update start time
               await updateScheduleSlot({
                  start: newStartTime.toISOString()
               })
            }
         },
         [updateScheduleSlot, slot.end]
      )

      const handleEndTimeChange = useCallback(
         async (e) => {
            e.preventDefault()
            const newEndTime = new Date(e.target.value)
            newEndTime.setSeconds(0, 0) // Set seconds and milliseconds to 0

            const currentStartTime = new Date(slot.start)

            // Validate: if new end time is equal or earlier than start time
            if (newEndTime <= currentStartTime) {
               // Auto-correct: set start time to 1 hour before new end time
               const correctedStartTime = new Date(newEndTime)
               correctedStartTime.setHours(correctedStartTime.getHours() - 1)

               // Update both start and end times
               await updateScheduleSlot({
                  start: correctedStartTime.toISOString(),
                  end: newEndTime.toISOString()
               })
            } else {
               // Only update end time
               await updateScheduleSlot({
                  end: newEndTime.toISOString()
               })
            }
         },
         [updateScheduleSlot, slot.start]
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
      // SYNC STATUS COMPONENTS
      // -------------------------------------------------------------------------

      const syncButton = useMemo(() => {
         const syncStatus = slot.sync_status

         // If no sync status or NONE, show sync dropdown
         if (!syncStatus || syncStatus === SCHEDULE_SYNCE_STATUS.NONE) {
            if (googleAccounts.length === 0) {
               return (
                  <Button
                     size='sm'
                     variant='ghost'
                     colorScheme='gray'
                     isDisabled
                     leftIcon={<PiCloudArrowUp size={16} />}
                  >
                     No Accounts
                  </Button>
               )
            }

            return (
               <Menu>
                  <MenuButton
                     as={Button}
                     size='sm'
                     variant='ghost'
                     colorScheme='blue'
                     isLoading={syncLoading}
                  >
                     Sync
                  </MenuButton>
                  <MenuList zIndex={10}>
                     {googleAccounts.map((account, accountIndex) => {
                        const accountCalendars = googleCalendars.filter(
                           (cal) => cal.accountId === account.accountId
                        )

                        if (accountCalendars.length === 0) return null

                        return (
                           <MenuOptionGroup
                              key={account.accountId}
                              title={account.accountEmail}
                              fontSize='sm'
                              type='button'
                           >
                              {accountCalendars.map((calendar) => (
                                 <MenuItemOption
                                    key={`${account.accountId}-${calendar.calendarId}`}
                                    value={calendar.calendarId}
                                    onClick={() => {
                                       syncWithGoogle(
                                          account.accountId,
                                          calendar.calendarId
                                       )
                                    }}
                                 >
                                    <HStack spacing={2}>
                                       <Text fontSize='sm' fontWeight='medium'>
                                          {calendar.title}
                                       </Text>
                                    </HStack>
                                 </MenuItemOption>
                              ))}
                              {accountIndex < googleAccounts.length - 1 && (
                                 <Divider />
                              )}
                           </MenuOptionGroup>
                        )
                     })}
                  </MenuList>
               </Menu>
            )
         }

         // If SYNCED, show sync info
         if (syncStatus === SCHEDULE_SYNCE_STATUS.SYNCED) {
            const syncedAccount = googleAccounts.find(
               (acc) => acc.accountId === slot.google_account_id
            )
            const syncedCalendar = googleCalendars.find(
               (cal) =>
                  cal.calendarId === slot.google_calendar_id &&
                  cal.accountId === slot.google_account_id
            )

            return (
               <Menu>
                  <MenuButton
                     as={Button}
                     size='sm'
                     variant='ghost'
                     colorScheme='green'
                     leftIcon={<PiCalendarCheck size={16} />}
                  >
                     <Badge colorScheme='green' size='sm'>
                        Synced
                     </Badge>
                  </MenuButton>
                  <MenuList zIndex={10}>
                     {syncedCalendar && (
                        <MenuItem value='calendar'>
                           <VStack spacing={2} align='start'>
                              <Text fontSize='sm'>
                                 Account: {syncedAccount.accountEmail}
                              </Text>
                              <Text fontSize='sm'>
                                 Calendar: {syncedCalendar.title}
                              </Text>
                           </VStack>
                        </MenuItem>
                     )}
                  </MenuList>
               </Menu>
            )
         }

         // For other statuses (errors, etc.), show status badge
         const getStatusProps = () => {
            switch (syncStatus) {
               case SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED:
                  return {
                     colorScheme: 'orange',
                     text: 'Account Disconnected'
                  }
               case SCHEDULE_SYNCE_STATUS.EVENT_NOT_FOUND:
                  return {
                     colorScheme: 'yellow',
                     text: 'Event Not Found'
                  }
               case SCHEDULE_SYNCE_STATUS.NOT_SYNCED:
                  return {
                     colorScheme: 'orange',
                     text: 'Out of Sync'
                  }
               case SCHEDULE_SYNCE_STATUS.SYNC_ERROR:
                  return {
                     colorScheme: 'red',
                     text: 'Sync Error'
                  }
               default:
                  return {
                     colorScheme: 'gray',
                     text: 'Unknown'
                  }
            }
         }

         const statusProps = getStatusProps()
         return (
            <Badge colorScheme={statusProps.colorScheme} size='sm'>
               {statusProps.text}
            </Badge>
         )
      }, [
         slot.sync_status,
         slot.google_account_id,
         slot.google_calendar_id,
         googleAccounts,
         googleCalendars,
         syncWithGoogle,
         syncLoading
      ])

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
            {syncButton}
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
      end: PropTypes.string.isRequired,
      sync_status: PropTypes.string,
      google_account_id: PropTypes.string,
      google_calendar_id: PropTypes.string
   }).isRequired,
   index: PropTypes.number.isRequired,
   updateTaskScheduleAction: PropTypes.func.isRequired,
   removeTaskScheduleSlotAction: PropTypes.func.isRequired,
   syncTaskWithGoogleAction: PropTypes.func.isRequired,
   scheduleData: PropTypes.shape({
      task: PropTypes.object.isRequired,
      pageId: PropTypes.string.isRequired
   }).isRequired,
   googleData: PropTypes.shape({
      googleAccounts: PropTypes.array.isRequired,
      googleCalendars: PropTypes.array.isRequired
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

const selectGoogleData = createSelector(
   [
      (state) => state.googleAccount.googleAccounts,
      (state) => state.googleAccount.googleCalendars
   ],
   (googleAccounts, googleCalendars) => ({
      googleAccounts,
      googleCalendars
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   scheduleData: selectScheduleData(state),
   googleData: selectGoogleData(state)
})

const mapDispatchToProps = {
   updateTaskScheduleAction,
   removeTaskScheduleSlotAction,
   syncTaskWithGoogleAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleTimeSlot)
