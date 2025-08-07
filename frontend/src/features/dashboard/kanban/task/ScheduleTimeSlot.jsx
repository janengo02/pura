// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Actions
import {
   updateTaskScheduleAction,
   removeTaskScheduleSlotAction,
   syncTaskWithGoogleAction,
   showTaskModalAction
} from '../../../../actions/taskActions'
import { addGoogleAccountAction } from '../../../../actions/googleAccountActions'
import { setAlertAction } from '../../../../actions/alertActions'

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
   HStack,
   Divider,
   MenuItem,
   VStack,
   Image,
   Box,
   Tooltip
} from '@chakra-ui/react'

// Utils & Icons
import { stringToDateTimeLocal } from '../../../../utils/dates'

// Hooks
import useLoading from '../../../../hooks/useLoading'
import {
   PiArrowClockwise,
   PiCalendarPlus,
   PiPlugs,
   PiTrash
} from 'react-icons/pi'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '@pura/shared'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// Utils
import { useGoogleAccountLogin } from '../../../../utils/googleAuthHelpers'

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
      addGoogleAccountAction,
      setAlertAction,
      showTaskModalAction,
      scheduleData: { task, pageId },
      googleData: { googleAccounts, googleCalendars },
      settingsData: { range }
   }) => {
      // -------------------------------------------------------------------------
      // SCHEDULE UPDATE HANDLERS
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

      // -------------------------------------------------------------------------
      // ANIMATION STATE
      // -------------------------------------------------------------------------
      const [showHighlight, setShowHighlight] = useState(false)

      // -------------------------------------------------------------------------
      // GOOGLE LOGIN HANDLER
      // -------------------------------------------------------------------------
      const refetchTaskModalIfOpen = useCallback(async () => {
         // Check if task modal is displayed (task exists in state)
         if (task && pageId) {
            const formData = {
               page_id: pageId,
               task_id: task._id
            }
            await showTaskModalAction(formData)
         }
      }, [task, pageId, showTaskModalAction])

      const googleReconnectLogin = useGoogleAccountLogin({
         onSuccess: async (code, range) => {
            await addGoogleAccountAction({ code, range })
            // Reload task modal data after successful Google account reconnection
            await refetchTaskModalIfOpen()
         },
         onError: () => {
            setAlertAction(
               'alert-google_calendar-account-connect_failed',
               '',
               'error'
            )
         },
         range
      })

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
            const [accountEmail, calendarId] = args
            const reqData = {
               task_id: task._id,
               slot_index: index,
               account_email: accountEmail,
               calendar_id: calendarId,
               sync_action: 'create'
            }
            await syncTaskWithGoogleAction(reqData)
         },
         [task._id, index, syncTaskWithGoogleAction]
      )

      const handleUnsyncFromGoogle = useCallback(async () => {
         const reqData = {
            task_id: task._id,
            slot_index: index,
            sync_action: 'delete'
         }
         await syncTaskWithGoogleAction(reqData)
      }, [task._id, index, syncTaskWithGoogleAction])

      // -------------------------------------------------------------------------
      // SYNC RESOLUTION HANDLERS
      // -------------------------------------------------------------------------

      const handleUseTaskTime = useCallback(async () => {
         await updateScheduleSlot({
            start: slot.start,
            end: slot.end
         })
      }, [updateScheduleSlot, slot.start, slot.end])

      const handleUseGoogleTime = useCallback(async () => {
         if (slot.google_event_start && slot.google_event_end) {
            await updateScheduleSlot({
               start: slot.google_event_start,
               end: slot.google_event_end
            })
         }
      }, [updateScheduleSlot, slot.google_event_start, slot.google_event_end])

      // -------------------------------------------------------------------------
      // LOADING STATES
      // -------------------------------------------------------------------------

      const [syncWithGoogle, syncLoading] = useLoading(handleSyncWithGoogle)
      const [unsyncFromGoogle, unsyncLoading] = useLoading(
         handleUnsyncFromGoogle
      )
      const [useTaskTime, useTaskTimeLoading] = useLoading(handleUseTaskTime)
      const [useGoogleTime, useGoogleTimeLoading] =
         useLoading(handleUseGoogleTime)

      // -------------------------------------------------------------------------
      // UI EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleStartTimeChange = useCallback(
         async (e) => {
            e.preventDefault()

            // Handle empty or invalid input
            if (!e.target.value) {
               return
            }

            const newStartTime = new Date(e.target.value)

            // Validate that the input is a valid date
            if (isNaN(newStartTime.getTime())) {
               return
            }

            newStartTime.setSeconds(0, 0) // Set seconds and milliseconds to 0

            const currentEndTime = new Date(slot.end)

            // Additional validation for end time
            if (isNaN(currentEndTime.getTime())) {
               return
            }

            // Validate: if new start time is equal or later than end time
            if (newStartTime >= currentEndTime) {
               // Auto-correct: set end time to 1 hour after new start time
               const correctedEndTime = new Date(
                  newStartTime.getTime() + 60 * 60 * 1000
               ) // Add 1 hour in milliseconds

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

            // Handle empty or invalid input
            if (!e.target.value) {
               return
            }

            const newEndTime = new Date(e.target.value)

            // Validate that the input is a valid date
            if (isNaN(newEndTime.getTime())) {
               return
            }

            newEndTime.setSeconds(0, 0) // Set seconds and milliseconds to 0

            const currentStartTime = new Date(slot.start)

            // Additional validation for start time
            if (isNaN(currentStartTime.getTime())) {
               return
            }

            // Validate: if new end time is equal or earlier than start time
            if (newEndTime <= currentStartTime) {
               // Auto-correct: set start time to 1 hour before new end time
               const correctedStartTime = new Date(
                  newEndTime.getTime() - 60 * 60 * 1000
               ) // Subtract 1 hour in milliseconds

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
            await handleDeleteSlot()
         },
         [handleDeleteSlot]
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

      // -------------------------------------------------------------------------
      // ANIMATION EFFECT
      // -------------------------------------------------------------------------
      useEffect(() => {
         if (timeSlotState.isViewingCalendarEvent) {
            setShowHighlight(true)
            const timer = setTimeout(() => {
               setShowHighlight(false)
            }, 1000) // 2 seconds

            return () => clearTimeout(timer)
         }
      }, [timeSlotState])

      const timeInputProps = useMemo(
         () => ({
            size: 'md',
            type: 'datetime-local',
            variant: 'filled',
            width: 'auto',
            borderRadius: 'md',
            bg: showHighlight ? 'accent.subtle' : 'bg.canvas',
            transition: 'background-color 0.3s ease'
         }),
         [showHighlight]
      )

      const startTimeInput = useMemo(
         () => (
            <Input
               {...timeInputProps}
               value={timeSlotState.startTime}
               onChange={handleStartTimeChange}
            />
         ),
         [timeInputProps, timeSlotState.startTime, handleStartTimeChange]
      )

      const endTimeInput = useMemo(
         () => (
            <Input
               {...timeInputProps}
               value={timeSlotState.endTime}
               onChange={handleEndTimeChange}
            />
         ),
         [timeInputProps, timeSlotState.endTime, handleEndTimeChange]
      )

      const deleteButton = useMemo(
         () => (
            <IconButton
               icon={<PiTrash size={18} />}
               variant='ghost'
               colorScheme='gray'
               color='text.primary'
               size='md'
               onClick={handleDeleteClick}
            />
         ),
         [handleDeleteClick]
      )

      // -------------------------------------------------------------------------
      // SYNC STATUS HELPER COMPONENTS
      // -------------------------------------------------------------------------

      // Reusable icon component
      const StatusIcon = useCallback(
         ({ src }) => (
            <Image src={src} boxSize={4} alt='Google Calendar Status' />
         ),
         []
      )

      // Reusable status box wrapper
      const StatusBox = useCallback(
         ({ bgColor, children }) => (
            <Box p={3} bg={bgColor} borderRadius='md'>
               {children}
            </Box>
         ),
         []
      )

      // Account display component
      const AccountDisplay = useCallback(
         ({ account, calendar, textColor = 'text.primary' }) => (
            <VStack spacing={2} align='start'>
               <HStack spacing={2}>
                  <Image
                     src='assets/img/logos--google-calendar.svg'
                     boxSize={3}
                     alt='Google'
                  />
                  <Text fontSize='md' fontWeight='semibold' color={textColor}>
                     {account?.accountEmail}
                  </Text>
               </HStack>
               {calendar && (
                  <HStack spacing={2}>
                     <Box
                        w={3}
                        h={3}
                        borderRadius='full'
                        bg={calendar?.color || 'blue.500'}
                        flexShrink={0}
                     />
                     <Text fontSize='md' color={textColor}>
                        {calendar?.title}
                     </Text>
                  </HStack>
               )}
            </VStack>
         ),
         []
      )

      // Centered message component
      const StatusMessage = useCallback(
         ({ children, color = 'text.primary' }) => (
            <Text fontSize='md' color={color}>
               {children}
            </Text>
         ),
         []
      )

      // Calendar list component
      const SyncableCalendarList = useMemo(() => {
         if (googleAccounts.length === 0) {
            return (
               <MenuItem size='md' isDisabled>
                  <Text fontSize='md' color='text.secondary'>
                     {t('sync-no-accounts-connected')}
                  </Text>
               </MenuItem>
            )
         }

         return googleAccounts.map((account) => {
            const accountCalendars = googleCalendars.filter(
               (cal) =>
                  cal.accountEmail === account.accountEmail &&
                  (cal.accessRole === 'owner' || cal.accessRole === 'writer')
            )

            if (accountCalendars.length === 0) return null

            return (
               <MenuOptionGroup
                  key={account.accountEmail}
                  title={account.accountEmail}
                  fontSize='md'
                  type='button'
               >
                  {accountCalendars.map((calendar) => (
                     <MenuItemOption
                        key={`${account.accountEmail}-${calendar.calendarId}`}
                        value={calendar.calendarId}
                        onClick={() => {
                           syncWithGoogle(
                              account.accountEmail,
                              calendar.calendarId
                           )
                        }}
                     >
                        <HStack spacing={3} w='full'>
                           <Box
                              w={3}
                              h={3}
                              borderRadius='full'
                              bg={calendar.color || 'primary.500'}
                              flexShrink={0}
                           />
                           <VStack spacing={0} align='start' flex={1}>
                              <Text fontSize='md' fontWeight='medium'>
                                 {calendar.title}
                              </Text>
                           </VStack>
                        </HStack>
                     </MenuItemOption>
                  ))}
               </MenuOptionGroup>
            )
         })
      }, [googleAccounts, googleCalendars, syncWithGoogle, t])

      // Helper function to format time
      const formatTime = useCallback((dateString) => {
         try {
            return new Date(dateString).toLocaleString(undefined, {
               month: 'short',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
            })
         } catch {
            return 'Invalid date'
         }
      }, [])

      // Sync status configuration
      const getSyncConfig = useCallback(
         (syncStatus) => {
            const syncedAccount = googleAccounts.find(
               (acc) => acc.accountEmail === slot.google_account_email
            )
            const syncedCalendar = googleCalendars.find(
               (cal) =>
                  cal.calendarId === slot.google_calendar_id &&
                  cal.accountEmail === slot.google_account_email
            )

            const configs = {
               [SCHEDULE_SYNCE_STATUS.SYNCED]: {
                  colorScheme: 'green',
                  icon: (
                     <StatusIcon src='assets/img/logos--google-calendar-synced.svg' />
                  ),
                  desc: (
                     <StatusBox bgColor='status.synced.bg'>
                        <AccountDisplay
                           account={syncedAccount}
                           calendar={syncedCalendar}
                           textColor='status.synced.text'
                        />
                     </StatusBox>
                  ),
                  actions: (
                     <MenuItem
                        icon={<PiPlugs size={18} />}
                        onClick={unsyncFromGoogle}
                     >
                        {t('sync-unsync-action')}
                     </MenuItem>
                  )
               },
               [SCHEDULE_SYNCE_STATUS.NONE]: {
                  colorScheme: 'gray',
                  icon: <PiCalendarPlus size={18} color='text.primary' />,
                  desc: (
                     <StatusBox bgColor='bg.subtle'>
                        <StatusMessage>
                           {t('sync-select-calendar-message')}
                        </StatusMessage>
                     </StatusBox>
                  ),
                  actions: SyncableCalendarList
               },
               [SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED]: {
                  colorScheme: 'yellow',
                  icon: (
                     <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />
                  ),
                  desc: (
                     <StatusBox bgColor='status.disconnected.bg'>
                        <VStack spacing={2} align='start'>
                           {slot.google_account_email && (
                              <AccountDisplay
                                 account={{
                                    accountEmail: slot.google_account_email
                                 }}
                                 calendar={null}
                                 textColor='status.disconnected.text'
                              />
                           )}
                           <StatusMessage color='status.disconnected.text'>
                              {t('sync-account-disconnected-message')}
                           </StatusMessage>
                        </VStack>
                     </StatusBox>
                  ),
                  actions: (
                     <>
                        <MenuItem
                           icon={<PiArrowClockwise size={18} />}
                           onClick={googleReconnectLogin}
                        >
                           {t('sync-reconnect-action')}
                        </MenuItem>
                        <MenuItem
                           icon={<PiPlugs size={18} />}
                           onClick={unsyncFromGoogle}
                        >
                           {t('sync-unsync-action')}
                        </MenuItem>
                     </>
                  )
               },
               [SCHEDULE_SYNCE_STATUS.EVENT_NOT_FOUND]: {
                  colorScheme: 'orange',
                  icon: (
                     <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />
                  ),
                  desc: (
                     <StatusBox bgColor='status.warning.bg'>
                        <VStack spacing={2} align='start'>
                           {slot.google_account_email && (
                              <AccountDisplay
                                 account={{
                                    accountEmail: slot.google_account_email
                                 }}
                                 calendar={syncedCalendar}
                                 textColor='status.warning.text'
                              />
                           )}
                           <StatusMessage color='status.warning.text'>
                              {t('sync-event-not-found-message')}
                           </StatusMessage>
                        </VStack>
                     </StatusBox>
                  ),
                  actions: (
                     <MenuItem
                        icon={<PiPlugs size={18} />}
                        onClick={unsyncFromGoogle}
                     >
                        {t('sync-unsync-action')}
                     </MenuItem>
                  )
               },
               [SCHEDULE_SYNCE_STATUS.CONFLICTED]: {
                  colorScheme: 'orange',
                  icon: (
                     <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />
                  ),
                  desc: (
                     <StatusBox bgColor='status.warning.bg'>
                        <VStack spacing={2} align='start'>
                           {slot.google_account_email && (
                              <AccountDisplay
                                 account={{
                                    accountEmail: slot.google_account_email
                                 }}
                                 calendar={syncedCalendar}
                                 textColor='status.warning.text'
                              />
                           )}
                           <StatusMessage color='status.warning.text'>
                              {t('sync-times-mismatch-title')}
                           </StatusMessage>
                        </VStack>
                     </StatusBox>
                  ),
                  actions: (
                     <>
                        <MenuItem
                           onClick={useTaskTime}
                           isDisabled={useTaskTimeLoading}
                        >
                           <VStack spacing={1} align='start'>
                              <Text fontSize='md' fontWeight='medium'>
                                 {t('sync-use-task-time')}
                              </Text>
                              <Text fontSize='xs' color='text.secondary'>
                                 {formatTime(slot.start)} -{' '}
                                 {formatTime(slot.end)}
                              </Text>
                           </VStack>
                        </MenuItem>
                        {slot.google_event_start && slot.google_event_end && (
                           <MenuItem
                              onClick={useGoogleTime}
                              isDisabled={useGoogleTimeLoading}
                           >
                              <VStack spacing={1} align='start'>
                                 <Text fontSize='md' fontWeight='medium'>
                                    {t('sync-use-google-time')}
                                 </Text>
                                 <Text fontSize='xs' color='text.secondary'>
                                    {formatTime(slot.google_event_start)} -{' '}
                                    {formatTime(slot.google_event_end)}
                                 </Text>
                              </VStack>
                           </MenuItem>
                        )}

                        <MenuItem
                           icon={<PiPlugs size={18} />}
                           onClick={unsyncFromGoogle}
                        >
                           {t('sync-unsync-action')}
                        </MenuItem>
                     </>
                  )
               },
               [SCHEDULE_SYNCE_STATUS.SYNC_ERROR]: {
                  colorScheme: 'red',
                  icon: (
                     <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />
                  ),
                  desc: (
                     <StatusBox bgColor='status.error.bg'>
                        <StatusMessage color='status.error.text'>
                           {t('sync-error-occurred-message')}
                           <br />
                           {t('sync-error-retry-message')}
                        </StatusMessage>
                     </StatusBox>
                  )
               }
            }

            return (
               configs[syncStatus] || {
                  colorScheme: 'gray',
                  icon: (
                     <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />
                  ),
                  desc: (
                     <StatusBox bgColor='bg.subtle'>
                        <StatusMessage>
                           {t('sync-unknown-status-message')}
                           <br />
                           {t('sync-unknown-status-action')}
                        </StatusMessage>
                     </StatusBox>
                  )
               }
            )
         },
         [
            googleAccounts,
            googleCalendars,
            slot,
            SyncableCalendarList,
            t,
            googleReconnectLogin,
            unsyncFromGoogle,
            formatTime,
            useTaskTime,
            useGoogleTime,
            useTaskTimeLoading,
            useGoogleTimeLoading
         ]
      )

      const syncButton = useMemo(() => {
         const syncStatus = slot.sync_status
         const syncProps = getSyncConfig(syncStatus)

         return (
            <Tooltip
               label={`${t('sync-status-tooltip')}: ${syncStatus}`}
               placement='top'
               hasArrow
            >
               <Menu>
                  <MenuButton
                     as={Button}
                     size='md'
                     variant='ghost'
                     colorScheme={syncProps.colorScheme}
                     isLoading={
                        syncLoading ||
                        unsyncLoading ||
                        useTaskTimeLoading ||
                        useGoogleTimeLoading
                     }
                     display='flex'
                     alignItems='center'
                     justifyContent='center'
                  >
                     {syncProps.icon}
                  </MenuButton>
                  <MenuList zIndex={10} minW='300px' p={0}>
                     <Box p={2}>{syncProps.desc}</Box>
                     {syncProps.desc && syncProps.actions && (
                        <Divider borderColor='gray.200' />
                     )}
                     {syncProps.actions && (
                        <Box maxH='200px' overflowY='auto'>
                           {syncProps.actions}
                        </Box>
                     )}
                  </MenuList>
               </Menu>
            </Tooltip>
         )
      }, [
         slot.sync_status,
         getSyncConfig,
         syncLoading,
         unsyncLoading,
         useTaskTimeLoading,
         useGoogleTimeLoading,
         t
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
      google_account_email: PropTypes.string,
      google_calendar_id: PropTypes.string
   }).isRequired,
   index: PropTypes.number.isRequired,
   updateTaskScheduleAction: PropTypes.func.isRequired,
   removeTaskScheduleSlotAction: PropTypes.func.isRequired,
   syncTaskWithGoogleAction: PropTypes.func.isRequired,
   addGoogleAccountAction: PropTypes.func.isRequired,
   setAlertAction: PropTypes.func.isRequired,
   showTaskModalAction: PropTypes.func.isRequired,
   scheduleData: PropTypes.shape({
      task: PropTypes.object.isRequired,
      pageId: PropTypes.string.isRequired
   }).isRequired,
   googleData: PropTypes.shape({
      googleAccounts: PropTypes.array.isRequired,
      googleCalendars: PropTypes.array.isRequired
   }).isRequired,
   settingsData: PropTypes.shape({
      range: PropTypes.string.isRequired
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

const selectSettingsData = createSelector(
   [(state) => state.googleAccount.range],
   (range) => ({
      range
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   scheduleData: selectScheduleData(state),
   googleData: selectGoogleData(state),
   settingsData: selectSettingsData(state)
})

const mapDispatchToProps = {
   updateTaskScheduleAction,
   removeTaskScheduleSlotAction,
   syncTaskWithGoogleAction,
   addGoogleAccountAction,
   setAlertAction,
   showTaskModalAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleTimeSlot)
