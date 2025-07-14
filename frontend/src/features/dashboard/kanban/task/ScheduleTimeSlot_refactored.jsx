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
import { PiTrash } from 'react-icons/pi'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '@pura/shared'

// =============================================================================
// SYNC STATUS HELPER COMPONENTS
// =============================================================================

const StatusIcon = React.memo(({ src }) => (
   <Image src={src} boxSize={4} alt='Google Calendar Status' />
))

const StatusBox = React.memo(({ bgColor, children }) => (
   <Box p={3} bg={bgColor} borderRadius='md'>
      {children}
   </Box>
))

const AccountDisplay = React.memo(({ account, calendar, textColor = 'gray.700' }) => (
   <VStack spacing={2} align='start'>
      <HStack spacing={2}>
         <Image src='assets/img/logos--google.svg' boxSize={3} alt='Google' />
         <Text fontSize='sm' fontWeight='semibold' color={textColor}>
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
            <Text fontSize='sm' color={textColor.replace('.700', '.600')}>
               {calendar?.title}
            </Text>
         </HStack>
      )}
   </VStack>
))

const CenteredMessage = React.memo(({ children, color = 'gray.600' }) => (
   <Text fontSize='sm' color={color} textAlign='center'>
      {children}
   </Text>
))

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
      // CENTRALIZED UPDATE HANDLER
      // -------------------------------------------------------------------------

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

      // -------------------------------------------------------------------------
      // DELETE HANDLER
      // -------------------------------------------------------------------------

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
      // SYNC HANDLER
      // -------------------------------------------------------------------------

      const handleSyncWithGoogle = useCallback(
         async (args) => {
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

      // -------------------------------------------------------------------------
      // LOADING STATES
      // -------------------------------------------------------------------------

      const [deleteSlot, deleteSlotLoading] = useLoading(handleDeleteSlot)
      const [syncWithGoogle, syncLoading] = useLoading(handleSyncWithGoogle)

      // -------------------------------------------------------------------------
      // TIME CHANGE HANDLERS
      // -------------------------------------------------------------------------

      const handleStartTimeChange = useCallback(
         async (e) => {
            e.preventDefault()
            const newStartTime = new Date(e.target.value)
            newStartTime.setSeconds(0, 0)

            const currentEndTime = new Date(slot.end)

            if (newStartTime >= currentEndTime) {
               const correctedEndTime = new Date(newStartTime)
               correctedEndTime.setHours(correctedEndTime.getHours() + 1)

               await updateScheduleSlot({
                  start: newStartTime.toISOString(),
                  end: correctedEndTime.toISOString()
               })
            } else {
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
            newEndTime.setSeconds(0, 0)

            const currentStartTime = new Date(slot.start)

            if (newEndTime <= currentStartTime) {
               const correctedStartTime = new Date(newEndTime)
               correctedStartTime.setHours(correctedStartTime.getHours() - 1)

               await updateScheduleSlot({
                  start: correctedStartTime.toISOString(),
                  end: newEndTime.toISOString()
               })
            } else {
               await updateScheduleSlot({
                  end: newEndTime.toISOString()
               })
            }
         },
         [updateScheduleSlot, slot.start]
      )

      // -------------------------------------------------------------------------
      // SYNCABLE CALENDAR LIST
      // -------------------------------------------------------------------------

      const SyncableCalendarList = useMemo(() => {
         if (googleAccounts.length === 0) {
            return (
               <MenuItem size='sm' isDisabled>
                  <Text fontSize='sm' color='gray.500'>
                     No Google accounts connected
                  </Text>
               </MenuItem>
            )
         }

         return googleAccounts.map((account) => {
            const accountCalendars = googleCalendars.filter(
               (cal) => cal.accountEmail === account.accountEmail
            )

            if (accountCalendars.length === 0) return null

            return (
               <MenuOptionGroup
                  key={account.accountEmail}
                  title={account.accountEmail}
                  fontSize='sm'
                  type='button'
               >
                  {accountCalendars.map((calendar) => (
                     <MenuItemOption
                        key={`${account.accountEmail}-${calendar.calendarId}`}
                        value={calendar.calendarId}
                        onClick={() => {
                           syncWithGoogle(account.accountEmail, calendar.calendarId)
                        }}
                     >
                        <HStack spacing={3} w='full'>
                           <Box
                              w={3}
                              h={3}
                              borderRadius='full'
                              bg={calendar.color || 'blue.500'}
                              flexShrink={0}
                           />
                           <VStack spacing={0} align='start' flex={1}>
                              <Text fontSize='sm' fontWeight='medium'>
                                 {calendar.title}
                              </Text>
                           </VStack>
                        </HStack>
                     </MenuItemOption>
                  ))}
               </MenuOptionGroup>
            )
         })
      }, [googleAccounts, googleCalendars, syncWithGoogle])

      // -------------------------------------------------------------------------
      // SYNC STATUS CONFIGURATION
      // -------------------------------------------------------------------------

      const getSyncConfig = useCallback((syncStatus) => {
         const syncedAccount = googleAccounts.find(
            (acc) => acc.accountEmail === slot.google_account_id
         )
         const syncedCalendar = googleCalendars.find(
            (cal) =>
               cal.calendarId === slot.google_calendar_id &&
               cal.accountEmail === slot.google_account_id
         )

         const configs = {
            [SCHEDULE_SYNCE_STATUS.SYNCED]: {
               colorScheme: 'green',
               icon: <StatusIcon src='assets/img/logos--google-calendar-synced.svg' />,
               desc: (
                  <StatusBox bgColor='green.50'>
                     <AccountDisplay 
                        account={syncedAccount} 
                        calendar={syncedCalendar} 
                        textColor='green.700' 
                     />
                  </StatusBox>
               ),
               actions: <MenuItem>Unsync</MenuItem>
            },
            [SCHEDULE_SYNCE_STATUS.NONE]: {
               colorScheme: 'gray',
               icon: <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />,
               desc: (
                  <StatusBox bgColor='gray.50'>
                     <CenteredMessage>
                        Select a Google Calendar to sync this time slot
                     </CenteredMessage>
                  </StatusBox>
               ),
               actions: SyncableCalendarList
            },
            [SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED]: {
               colorScheme: 'yellow',
               icon: <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />,
               desc: (
                  <StatusBox bgColor='yellow.50'>
                     <VStack spacing={2} align='start'>
                        <AccountDisplay account={syncedAccount} textColor='yellow.700' />
                        <Text fontSize='sm' color='yellow.600'>
                           Account disconnected. Please reconnect to sync.
                        </Text>
                     </VStack>
                  </StatusBox>
               ),
               actions: <MenuItem>Reconnect</MenuItem>
            },
            [SCHEDULE_SYNCE_STATUS.EVENT_NOT_FOUND]: {
               colorScheme: 'orange',
               icon: <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />,
               desc: (
                  <StatusBox bgColor='orange.50'>
                     <CenteredMessage color='orange.600'>
                        Event not found in Google Calendar.
                        <br />
                        Create a new sync event below.
                     </CenteredMessage>
                  </StatusBox>
               ),
               actions: SyncableCalendarList
            },
            [SCHEDULE_SYNCE_STATUS.NOT_SYNCED]: {
               colorScheme: 'orange',
               icon: <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />,
               desc: (
                  <StatusBox bgColor='orange.50'>
                     <VStack spacing={2} align='center'>
                        <Text fontSize='sm' color='orange.600' fontWeight='semibold'>
                           Times don't match
                        </Text>
                        <Text fontSize='xs' color='orange.500' textAlign='center'>
                           This time slot and Google Calendar event have different times.
                           Choose which one to keep.
                        </Text>
                     </VStack>
                  </StatusBox>
               ),
               actions: (
                  <>
                     <MenuItem>Sync from PURA task</MenuItem>
                     <MenuItem>Sync from Google Calendar</MenuItem>
                  </>
               )
            },
            [SCHEDULE_SYNCE_STATUS.SYNC_ERROR]: {
               colorScheme: 'red',
               icon: <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />,
               desc: (
                  <StatusBox bgColor='red.50'>
                     <CenteredMessage color='red.600'>
                        Sync error occurred.
                        <br />
                        Please try again or check your connection.
                     </CenteredMessage>
                  </StatusBox>
               )
            }
         }

         return configs[syncStatus] || {
            colorScheme: 'gray',
            icon: <StatusIcon src='assets/img/logos--google-calendar-not-synced.svg' />,
            desc: (
               <StatusBox bgColor='gray.50'>
                  <CenteredMessage>
                     Unknown sync status.
                     <br />
                     Please refresh or check your settings.
                  </CenteredMessage>
               </StatusBox>
            )
         }
      }, [googleAccounts, googleCalendars, slot.google_account_id, slot.google_calendar_id, SyncableCalendarList])

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
               onClick={deleteSlot}
            />
         ),
         [deleteSlotLoading, deleteSlot]
      )

      const syncButton = useMemo(() => {
         const syncStatus = slot.sync_status
         const syncProps = getSyncConfig(syncStatus)

         return (
            <Tooltip
               label={`Google Calendar sync status: ${syncStatus}`}
               placement='top'
               hasArrow
            >
               <Menu>
                  <MenuButton
                     as={Button}
                     size='sm'
                     variant='ghost'
                     colorScheme={syncProps.colorScheme}
                     isLoading={syncLoading}
                     _hover={{ bg: `${syncProps.colorScheme}.100` }}
                     minW='32px'
                     h='32px'
                     p={0}
                     display='flex'
                     alignItems='center'
                     justifyContent='center'
                  >
                     {syncProps.icon}
                  </MenuButton>
                  <MenuList zIndex={10} minW='300px' p={0}>
                     <Box p={2}>
                        {syncProps.desc}
                     </Box>
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
      }, [slot.sync_status, getSyncConfig, syncLoading])

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

StatusIcon.displayName = 'StatusIcon'
StatusBox.displayName = 'StatusBox'
AccountDisplay.displayName = 'AccountDisplay'
CenteredMessage.displayName = 'CenteredMessage'
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