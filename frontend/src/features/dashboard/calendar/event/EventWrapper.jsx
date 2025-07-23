// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useRef, useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// UI Components
import {
   IconButton,
   Image,
   Popover,
   PopoverBody,
   PopoverContent,
   PopoverHeader,
   PopoverTrigger,
   HStack,
   Tag,
   TagLabel,
   Box,
   Text,
   VStack,
   Divider,
   Badge,
   Tooltip,
   Button,
   Avatar,
   AvatarBadge,
   AvatarGroup,
   Collapse,
   useDisclosure
} from '@chakra-ui/react'

// Icons & Components
import {
   PiTrash,
   PiCalendar,
   PiMapPin,
   PiVideoCamera,
   PiBell,
   PiUsers,
   PiClock,
   PiEye,
   PiLock,
   PiGlobeHemisphereWest,
   PiCopy,
   PiCaretDown,
   PiCaretUp,
   PiCheck,
   PiX,
   PiQuestion,
   PiCheckBold,
   PiXBold
} from 'react-icons/pi'
import EventWrapperTitle from '../../../../components/typography/EventWrapperTitle'
import EventTimeText from './EventTimeText'

// Actions & Hooks
import { deleteGoogleEventAction } from '../../../../actions/googleAccountActions'
import { showTaskModalAction } from '../../../../actions/taskActions'
import useLoading from '../../../../hooks/useLoading'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '@pura/shared'

// =============================================================================
// CONSTANTS
// =============================================================================

const BUTTON_STYLES = {
   variant: 'ghost',
   size: 'sm',
   colorScheme: 'gray',
   color: 'text.primary'
}

const POPOVER_STYLES = {
   placement: 'auto',
   isLazy: true,
   strategy: 'fixed',
   modifiers: [
      {
         name: 'preventOverflow',
         options: {
            boundary: 'viewport',
            padding: 8
         }
      },
      {
         name: 'flip',
         options: {
            fallbackPlacements: ['top', 'bottom', 'left', 'right']
         }
      }
   ]
}

const POPOVER_CONTENT_STYLES = {
   boxShadow: 'md',
   maxW: '400px',
   maxH: '80vh',
   w: 'full',
   overflow: 'hidden'
}

const POPOVER_HEADER_STYLES = {
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingX: 1,
   paddingTop: 1,
   paddingBottom: 0,
   border: 'none'
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EventWrapper = React.memo(
   ({
      children,
      event,
      // Redux props
      deleteGoogleEventAction,
      showTaskModalAction,
      eventData: { pageId }
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------

      const { t } = useReactiveTranslation()
      const { isOpen: isAttendeesOpen, onToggle: onAttendeesToggle } =
         useDisclosure()

      // -------------------------------------------------------------------------
      // REFS & STATE
      // -------------------------------------------------------------------------

      const initRef = useRef()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const taskId = useMemo(() => {
         // For 'task' and 'synced' eventTypes, use pura_task_id
         if (event.eventType === 'task' || event.eventType === 'synced') {
            return event.pura_task_id
         }
         return null
      }, [event.eventType, event.pura_task_id])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDelete = useCallback(async () => {
         const reqData = {
            eventId: event.id,
            calendarId: event.calendarId,
            accountEmail: event.accountEmail
         }
         await deleteGoogleEventAction(reqData)
      }, [
         deleteGoogleEventAction,
         event.id,
         event.calendarId,
         event.accountEmail
      ])

      const handleShowTask = useCallback(async () => {
         const formData = {
            page_id: pageId,
            task_id: taskId,
            target_event_index: event.pura_schedule_index
         }
         await showTaskModalAction(formData)
      }, [showTaskModalAction, pageId, taskId, event.pura_schedule_index])

      // -------------------------------------------------------------------------
      // LOADING HOOKS
      // -------------------------------------------------------------------------

      const [deleteEvent, deleteLoading] = useLoading(handleDelete)

      // -------------------------------------------------------------------------
      // RENDER HELPERS
      // -------------------------------------------------------------------------

      const renderSyncStatusTag = () => {
         if (event.eventType !== 'synced') return <Box w='full'></Box>

         const syncStatus = event.syncStatus
         let tagProps = {}

         if (syncStatus === SCHEDULE_SYNCE_STATUS.SYNCED) {
            tagProps = {
               colorScheme: 'green',
               size: 'sm'
            }
         } else if (syncStatus === SCHEDULE_SYNCE_STATUS.CONFLICTED) {
            tagProps = {
               colorScheme: 'orange',
               size: 'sm'
            }
         } else {
            return <Box w='full'></Box>
         }

         const statusText =
            syncStatus === SCHEDULE_SYNCE_STATUS.SYNCED
               ? t('sync-status-synced')
               : t('sync-status-conflicted')

         return (
            <Tag {...tagProps}>
               <TagLabel>{statusText}</TagLabel>
            </Tag>
         )
      }

      const renderActionButton = (onClose) => {
         let puraTaskIcon = null
         let googleCalendarIcon = null
         const deleteIcon = (
            <IconButton
               icon={<PiTrash size={16} />}
               {...BUTTON_STYLES}
               ref={initRef}
               isLoading={deleteLoading}
               onClick={async (e) => {
                  e.preventDefault()
                  await deleteEvent()
                  onClose()
               }}
            />
         )
         if (event.eventType === 'task' || event.eventType === 'synced') {
            puraTaskIcon = (
               <IconButton
                  icon={
                     <Image
                        src='assets/img/pura-logo-icon.svg'
                        boxSize={4}
                        alt='Pura Task'
                     />
                  }
                  {...BUTTON_STYLES}
                  onClick={async (e) => {
                     e.preventDefault()
                     await handleShowTask()
                  }}
               />
            )
         }
         if (event.eventType === 'google' || event.eventType === 'synced') {
            googleCalendarIcon = (
               <IconButton
                  icon={
                     <Image
                        src='assets/img/logos--google-calendar.svg'
                        boxSize={4}
                        alt='Google Calendar'
                     />
                  }
                  {...BUTTON_STYLES}
               />
            )
         }
         return (
            <HStack spacing={1}>
               {puraTaskIcon}
               {googleCalendarIcon}
               {deleteIcon}
            </HStack>
         )
      }

      const renderEventDescription = () => {
         if (!event.description) return null

         return (
            <VStack align='start' spacing={1} mb={3}>
               <Text fontSize='sm' fontWeight='medium' color='text.secondary'>
                  {t('event-description')}
               </Text>
               <Text
                  fontSize='sm'
                  color='text.primary'
                  whiteSpace='pre-wrap'
                  wordBreak='break-word'
               >
                  {event.description}
               </Text>
            </VStack>
         )
      }

      const renderEventLocation = () => {
         if (!event.location) return null

         return (
            <HStack spacing={2} mb={2}>
               <PiMapPin size={16} color='gray.500' />
               <VStack align='start' spacing={0}>
                  <Text
                     fontSize='sm'
                     color='text.primary'
                     wordBreak='break-word'
                  >
                     {event.location.displayName || event.location.raw}
                  </Text>
                  {event.location.address && (
                     <Text
                        fontSize='xs'
                        color='text.secondary'
                        wordBreak='break-word'
                     >
                        {event.location.address.full}
                     </Text>
                  )}
               </VStack>
            </HStack>
         )
      }

      const renderConferenceData = () => {
         if (!event.conferenceData) return null

         const { conferenceData } = event

         const handleCopyUrl = async () => {
            if (conferenceData.joinUrl) {
               try {
                  await navigator.clipboard.writeText(conferenceData.joinUrl)
                  // You could add a toast notification here if needed
               } catch (err) {
                  console.error('Failed to copy URL:', err)
               }
            }
         }

         const handleJoinMeeting = () => {
            if (conferenceData.joinUrl) {
               window.open(conferenceData.joinUrl, '_blank')
            }
         }

         return (
            <>
               {conferenceData.joinUrl && (
                  <VStack align='start' spacing={2} mb={3} w='full'>
                     <HStack spacing={2} w='full'>
                        <PiVideoCamera size={16} />
                        <HStack justifyContent='space-between' w='full'>
                           <Button
                              size='sm'
                              colorScheme='blue'
                              borderRadius='full'
                              onClick={handleJoinMeeting}
                           >
                              {t('event-join-meeting')}
                           </Button>

                           <Tooltip
                              label={t('copy-meeting-url')}
                              placement='top'
                           >
                              <IconButton
                                 size='sm'
                                 variant='ghost'
                                 onClick={handleCopyUrl}
                                 icon={<PiCopy size={14} />}
                              />
                           </Tooltip>
                        </HStack>
                     </HStack>
                     <Text fontSize='xs' color='text.secondary' ml={6}>
                        {t('meet-id')}: {conferenceData.id}
                     </Text>
                  </VStack>
               )}
            </>
         )
      }

      const renderAttendees = () => {
         if (!event.attendees || event.attendees.length === 0) return null

         const getResponseBadgeColor = (status) => {
            switch (status) {
               case 'accepted':
                  return 'green.400'
               case 'declined':
                  return 'red.400'
               case 'tentative':
                  return 'gray.400'
               default:
                  return 'gray.400'
            }
         }

         const getRandomColor = (str) => {
            // Generate consistent random color based on string hash
            let hash = 0
            for (let i = 0; i < str.length; i++) {
               hash = str.charCodeAt(i) + ((hash << 5) - hash)
            }

            // Array of pleasant avatar colors
            const colors = [
               'red.400',
               'orange.400',
               'yellow.400',
               'green.400',
               'blue.400',
               'cyan.400',
               'pink.400'
            ]

            return colors[Math.abs(hash) % colors.length]
         }

         const getAttendeeInitials = (attendee) => {
            if (attendee.displayName) {
               return attendee.displayName.charAt(0).toUpperCase()
            }
            if (attendee.email) {
               return attendee.email.charAt(0).toUpperCase()
            }
            return '?'
         }

         const getResponseStatusIcon = (responseStatus) => {
            switch (responseStatus) {
               case 'accepted':
                  return <PiCheckBold color='white' />
               case 'declined':
                  return <PiXBold color='white' />
               case 'tentative':
                  return <PiQuestion color='white' />
               default:
                  return <></>
            }
         }

         const renderAttendeeAvatar = (attendee) => {
            const name = attendee.displayName || attendee.email || 'Unknown'
            const colorKey = name.toLowerCase()
            const shouldShowBadge =
               attendee.responseStatus === 'accepted' ||
               attendee.responseStatus === 'declined'

            return (
               <Avatar
                  name={name}
                  size='sm'
                  bg={
                     attendee.isOrganizer
                        ? 'purple.400'
                        : getRandomColor(colorKey)
                  }
                  color='white'
               >
                  {getAttendeeInitials(attendee)}
                  {shouldShowBadge && (
                     <AvatarBadge
                        boxSize='1.25em'
                        bg={getResponseBadgeColor(attendee.responseStatus)}
                        border='1px solid'
                        borderColor='bg.surface'
                        borderRadius='full'
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                     >
                        {getResponseStatusIcon(attendee.responseStatus)}
                     </AvatarBadge>
                  )}
               </Avatar>
            )
         }

         // Calculate response statistics
         const responseStats = event.attendees.reduce(
            (stats, attendee) => {
               switch (attendee.responseStatus) {
                  case 'accepted':
                     stats.accepted++
                     break
                  case 'declined':
                     stats.declined++
                     break
                  case 'tentative':
                     stats.tentative++
                     break
                  default:
                     stats.awaiting++
                     break
               }
               return stats
            },
            { accepted: 0, declined: 0, tentative: 0, awaiting: 0 }
         )

         return (
            <VStack align='start' spacing={2} mb={3} w='full'>
               {/* Dropdown Header */}
               <Button
                  variant='ghost'
                  size='sm'
                  onClick={onAttendeesToggle}
                  justifyContent='flex-start'
                  p={2}
                  h='auto'
                  w='full'
                  leftIcon={<PiUsers size={16} />}
                  rightIcon={
                     isAttendeesOpen ? (
                        <PiCaretUp size={14} />
                     ) : (
                        <PiCaretDown size={14} />
                     )
                  }
               >
                  <VStack align='start' spacing={1}>
                     <Text
                        fontSize='sm'
                        fontWeight='medium'
                        color='text.primary'
                     >
                        {t('event-attendees')} ({event.attendees.length})
                     </Text>

                     {/* Response Summary */}
                     <HStack spacing={3} fontSize='xs'>
                        {responseStats.accepted > 0 && (
                           <HStack spacing={1}>
                              <Badge size='xs' colorScheme='green'>
                                 {responseStats.accepted}
                              </Badge>
                              <Text color='text.secondary'>
                                 {t('attendee-accepted')}
                              </Text>
                           </HStack>
                        )}
                        {responseStats.declined > 0 && (
                           <HStack spacing={1}>
                              <Badge size='xs' colorScheme='red'>
                                 {responseStats.declined}
                              </Badge>
                              <Text color='text.secondary'>
                                 {t('attendee-declined')}
                              </Text>
                           </HStack>
                        )}
                        {responseStats.tentative > 0 && (
                           <HStack spacing={1}>
                              <Badge size='xs' colorScheme='yellow'>
                                 {responseStats.tentative}
                              </Badge>
                              <Text color='text.secondary'>
                                 {t('attendee-tentative')}
                              </Text>
                           </HStack>
                        )}
                        {responseStats.awaiting > 0 && (
                           <HStack spacing={1}>
                              <Badge size='xs' colorScheme='gray'>
                                 {responseStats.awaiting}
                              </Badge>
                              <Text color='text.secondary'>
                                 {t('attendee-pending')}
                              </Text>
                           </HStack>
                        )}
                     </HStack>
                  </VStack>
               </Button>

               {/* Collapsible Detailed Attendee List */}
               <Collapse
                  in={isAttendeesOpen}
                  animateOpacity
                  style={{ width: '100%' }}
               >
                  <VStack align='start' spacing={3} pl={4} w='full'>
                     {/* Detailed Attendee List */}
                     <VStack align='start' spacing={2} w='full'>
                        {event.attendees.map((attendee, index) => (
                           <HStack
                              key={index}
                              justify='space-between'
                              w='full'
                              spacing={3}
                           >
                              <HStack spacing={3} flex={1} minW={0}>
                                 {renderAttendeeAvatar(attendee)}
                                 <VStack
                                    align='start'
                                    spacing={0}
                                    flex={1}
                                    minW={0}
                                 >
                                    <Text
                                       fontSize='sm'
                                       color='text.primary'
                                       wordBreak='break-word'
                                       flex={1}
                                       minW={0}
                                    >
                                       {attendee.displayName || attendee.email}
                                    </Text>

                                    {attendee.isOrganizer && (
                                       <Badge
                                          size='sm'
                                          colorScheme='purple'
                                          flexShrink={0}
                                       >
                                          {t('attendee-organizer')}
                                       </Badge>
                                    )}
                                 </VStack>
                              </HStack>
                           </HStack>
                        ))}
                     </VStack>
                  </VStack>
               </Collapse>
            </VStack>
         )
      }

      const renderReminders = () => {
         if (!event.reminders) return null

         const { reminders } = event
         if (
            reminders.useDefault &&
            (!reminders.overrides || reminders.overrides.length === 0)
         ) {
            return (
               <HStack spacing={2} mb={2}>
                  <PiBell size={16} color='gray.500' />
                  <Text fontSize='sm' color='text.primary'>
                     {t('event-default-reminders')}
                  </Text>
               </HStack>
            )
         }

         if (!reminders.overrides || reminders.overrides.length === 0)
            return null

         return (
            <VStack align='start' spacing={2} mb={3}>
               <HStack spacing={2}>
                  <PiBell size={16} color='gray.500' />
                  <Text fontSize='sm' fontWeight='medium' color='text.primary'>
                     {t('event-reminders')}
                  </Text>
               </HStack>
               <VStack align='start' spacing={1}>
                  {reminders.overrides.map((reminder, index) => {
                     const timeText =
                        reminder.minutes < 60
                           ? t('reminder-minutes', {
                                minutes: reminder.minutes
                             })
                           : t('reminder-hours', {
                                hours: Math.floor(reminder.minutes / 60)
                             })

                     return (
                        <HStack key={index} spacing={2}>
                           <Badge
                              size='sm'
                              colorScheme={
                                 reminder.method === 'email' ? 'blue' : 'orange'
                              }
                           >
                              {reminder.method === 'email'
                                 ? t('reminder-email')
                                 : t('reminder-popup')}
                           </Badge>
                           <Text fontSize='sm' color='text.primary'>
                              {timeText}
                           </Text>
                        </HStack>
                     )
                  })}
               </VStack>
            </VStack>
         )
      }

      const renderVisibilityInfo = () => {
         if (!event.visibility) return null

         const { visibility } = event
         let visibilityIcon = PiEye
         let visibilityText = t('visibility-default')
         let visibilityColor = 'gray'

         switch (visibility.visibility) {
            case 'private':
               visibilityIcon = PiLock
               visibilityText = t('visibility-private')
               visibilityColor = 'red'
               break
            case 'public':
               visibilityIcon = PiGlobeHemisphereWest
               visibilityText = t('visibility-public')
               visibilityColor = 'green'
               break
            case 'confidential':
               visibilityIcon = PiLock
               visibilityText = t('visibility-confidential')
               visibilityColor = 'orange'
               break
            default:
               // Keep default values for 'default' or unknown visibility
               break
         }

         if (visibility.visibility === 'default') return null

         return (
            <HStack spacing={2} mb={2}>
               {React.createElement(visibilityIcon, {
                  size: 16,
                  color: `${visibilityColor}.500`
               })}
               <Text fontSize='sm' color='text.primary'>
                  {visibilityText}
               </Text>
            </HStack>
         )
      }

      const renderCalendarInfo = () => {
         if (!event.calendar) return null

         return (
            <HStack spacing={2} mb={2}>
               <PiCalendar size={16} />
               <Text fontSize='sm' color='text.primary'>
                  {event.calendar}
               </Text>
            </HStack>
         )
      }

      const renderCreatedUpdatedInfo = () => {
         if (!event.createdDate && !event.updatedDate) return null

         return (
            <VStack
               align='start'
               spacing={1}
               mt={3}
               pt={3}
               borderTop='1px'
               borderColor='gray.200'
            >
               {event.createdDate && (
                  <HStack spacing={2}>
                     <PiClock size={14} color='gray.400' />
                     <Text fontSize='xs' color='text.secondary'>
                        {t('event-created')}:{' '}
                        {event.createdDate.toLocaleDateString()}
                     </Text>
                  </HStack>
               )}
               {event.updatedDate && (
                  <HStack spacing={2}>
                     <PiClock size={14} color='gray.400' />
                     <Text fontSize='xs' color='text.secondary'>
                        {t('event-updated')}:{' '}
                        {event.updatedDate.toLocaleDateString()}
                     </Text>
                  </HStack>
               )}
            </VStack>
         )
      }

      const renderPopoverContent = (onClose) => (
         <PopoverContent {...POPOVER_CONTENT_STYLES}>
            <PopoverHeader {...POPOVER_HEADER_STYLES}>
               {renderSyncStatusTag()}
               {renderActionButton(onClose)}
            </PopoverHeader>
            <PopoverBody
               p={4}
               maxW='100%'
               maxH='calc(80vh - 60px)'
               overflowY='auto'
            >
               <VStack align='start' spacing={3} w='full'>
                  <EventWrapperTitle text={event.title} />
                  <EventTimeText start={event.start} end={event.end} />
                  {renderConferenceData()}
                  {renderAttendees()}

                  {renderEventDescription()}
                  {renderEventLocation()}
                  {renderReminders()}
                  {renderVisibilityInfo()}
                  {renderCalendarInfo()}
                  {renderCreatedUpdatedInfo()}
               </VStack>
            </PopoverBody>
         </PopoverContent>
      )

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Popover {...POPOVER_STYLES} initialFocusRef={initRef}>
            {({ onClose }) => (
               <>
                  <PopoverTrigger>{children}</PopoverTrigger>
                  {renderPopoverContent(onClose)}
               </>
            )}
         </Popover>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
EventWrapper.displayName = 'EventWrapper'

// PropTypes validation
EventWrapper.propTypes = {
   children: PropTypes.node.isRequired,
   event: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
         .isRequired,
      end: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      calendar: PropTypes.string,
      calendarId: PropTypes.string,
      accountEmail: PropTypes.string,
      eventType: PropTypes.oneOf(['task', 'google', 'synced']).isRequired,
      pura_task_id: PropTypes.string,
      pura_schedule_index: PropTypes.number,
      syncStatus: PropTypes.string,
      description: PropTypes.string,
      location: PropTypes.shape({
         raw: PropTypes.string,
         displayName: PropTypes.string,
         address: PropTypes.shape({
            full: PropTypes.string,
            parts: PropTypes.array
         })
      }),
      attendees: PropTypes.arrayOf(
         PropTypes.shape({
            email: PropTypes.string,
            displayName: PropTypes.string,
            responseStatus: PropTypes.oneOf([
               'accepted',
               'declined',
               'tentative',
               'needsAction'
            ]),
            isOptional: PropTypes.bool,
            isOrganizer: PropTypes.bool,
            isSelf: PropTypes.bool
         })
      ),
      conferenceData: PropTypes.shape({
         type: PropTypes.string,
         joinUrl: PropTypes.string,
         phoneNumbers: PropTypes.array
      }),
      reminders: PropTypes.shape({
         useDefault: PropTypes.bool,
         overrides: PropTypes.arrayOf(
            PropTypes.shape({
               method: PropTypes.oneOf(['email', 'popup']),
               minutes: PropTypes.number
            })
         )
      }),
      organizer: PropTypes.shape({
         email: PropTypes.string,
         displayName: PropTypes.string,
         self: PropTypes.bool
      }),
      visibility: PropTypes.shape({
         visibility: PropTypes.oneOf([
            'default',
            'public',
            'private',
            'confidential'
         ]),
         transparency: PropTypes.string,
         status: PropTypes.string
      }),
      accessRole: PropTypes.string,
      createdDate: PropTypes.instanceOf(Date),
      updatedDate: PropTypes.instanceOf(Date)
   }).isRequired,
   deleteGoogleEventAction: PropTypes.func.isRequired,
   showTaskModalAction: PropTypes.func.isRequired,
   eventData: PropTypes.shape({
      pageId: PropTypes.string.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectEventWrapperData = createSelector(
   [(state) => state.page._id],
   (_id) => ({
      pageId: _id
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   eventData: selectEventWrapperData(state)
})

const mapDispatchToProps = {
   deleteGoogleEventAction,
   showTaskModalAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(EventWrapper)
