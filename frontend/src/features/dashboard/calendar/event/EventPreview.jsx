// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// UI Components
import {
   IconButton,
   Image,
   PopoverBody,
   PopoverContent,
   PopoverHeader,
   HStack,
   Tag,
   TagLabel,
   Box,
   VStack,
   useColorMode
} from '@chakra-ui/react'

// Icons & Components
import { PiPencilFill, PiTrash } from 'react-icons/pi'

// Event Components
import EventWrapperTitle from './EventTitle'
import EventTimeText from './EventTime'
import EventDescription from './EventDescription'
import EventLocation from './EventLocation'
import EventConference from './EventConference'
import EventAttendees from './EventAttendees'
import EventReminders from './EventReminders'
import EventVisibility from './EventVisibility'
import EventCalendarInfo from './EventCalendarInfo'

// Actions & Hooks
import { deleteGoogleEventAction } from '../../../../actions/calendarActions'
import {
   removeTaskScheduleSlotAction,
   showTaskModalAction
} from '../../../../actions/taskActions'
import { showEventEditModalAction } from '../../../../actions/eventActions'
import useLoading from '../../../../hooks/useLoading'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// Constants
import { SCHEDULE_SYNCE_STATUS } from '@pura/shared'

// =============================================================================
// CONSTANTS
// =============================================================================

const BUTTON_STYLES = {
   variant: 'ghost',
   size: 'md',
   colorScheme: 'gray',
   color: 'text.primary'
}

const POPOVER_CONTENT_STYLES = {
   boxShadow: 'md',
   w: '400px',
   maxH: '80vh',
   overflow: 'hidden',
   zIndex: 10000,
   position: 'relative',
   elevate: 'md'
}

const POPOVER_HEADER_STYLES = {
   display: 'flex',
   justifyContent: 'space-between',
   alignItems: 'center',
   paddingX: 2,
   paddingTop: 2,
   paddingBottom: 0,
   border: 'none'
}

const POPOVER_BODY_STYLES = {
   p: 4,
   maxW: '100%',
   maxH: 'calc(80vh - 60px)',
   overflowY: 'auto'
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EventPreview = React.memo(
   ({
      onClose,
      event,
      // Redux props
      deleteGoogleEventAction,
      removeTaskScheduleSlotAction,
      showTaskModalAction,
      showEventEditModalAction,
      eventData: { pageId }
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------

      const { t } = useReactiveTranslation()
      const { colorMode } = useColorMode()
      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const taskId = useMemo(() => {
         if (event.eventType === 'task' || event.eventType === 'synced') {
            return event.pura_task_id
         }
         return null
      }, [event.eventType, event.pura_task_id])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDelete = useCallback(async () => {
         if (event.eventType === 'google') {
            const reqData = {
               eventId: event.id,
               calendarId: event.calendarId,
               accountEmail: event.accountEmail
            }
            await deleteGoogleEventAction(reqData)
         } else {
            const reqData = {
               page_id: pageId,
               task_id: taskId,
               slot_index: event.pura_schedule_index
            }
            await removeTaskScheduleSlotAction(reqData)
         }
      }, [
         deleteGoogleEventAction,
         removeTaskScheduleSlotAction,
         event.id,
         event.calendarId,
         event.accountEmail,
         event.eventType,
         pageId,
         taskId,
         event.pura_schedule_index
      ])

      const handleShowTask = useCallback(async () => {
         const formData = {
            page_id: pageId,
            task_id: taskId,
            target_event_index: event.pura_schedule_index
         }
         await showTaskModalAction(formData)
      }, [showTaskModalAction, pageId, taskId, event.pura_schedule_index])

      const handleOpenGoogleEvent = () => {
         if (event.htmlLink) {
            window.open(event.htmlLink, '_blank')
         }
      }

      const handleShowEvent = useCallback(() => {
         const formData = {
            ...event,
            pageId
         }

         showEventEditModalAction(formData)
      }, [showEventEditModalAction, event, pageId])
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
               size: 'md'
            }
         } else if (syncStatus === SCHEDULE_SYNCE_STATUS.CONFLICTED) {
            tagProps = {
               colorScheme: 'orange',
               size: 'md'
            }
         } else {
            return <Box w='full'></Box>
         }

         const statusText =
            syncStatus === SCHEDULE_SYNCE_STATUS.SYNCED
               ? t('label-sync-status-synced')
               : t('label-sync-status-conflicted')

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
               icon={<PiTrash size={18} />}
               {...BUTTON_STYLES}
               isLoading={deleteLoading}
               onClick={async (e) => {
                  e.preventDefault()
                  await deleteEvent()
                  onClose()
               }}
            />
         )
         const editIcon = (
            <IconButton
               icon={<PiPencilFill size={18} />}
               {...BUTTON_STYLES}
               onClick={async (e) => {
                  e.preventDefault()
                  await handleShowEvent()
                  onClose()
               }}
            />
         )
         if (event.eventType === 'task' || event.eventType === 'synced') {
            puraTaskIcon = (
               <IconButton
                  icon={
                     <Image
                        src={
                           colorMode === 'dark'
                              ? '/assets/img/pura-logo-icon-white.png'
                              : '/assets/img/pura-logo-icon-purple.png'
                        }
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
                  onClick={handleOpenGoogleEvent}
                  {...BUTTON_STYLES}
               />
            )
         }
         return (
            <HStack spacing={1}>
               {puraTaskIcon}
               {googleCalendarIcon}
               {editIcon}
               {deleteIcon}
            </HStack>
         )
      }

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <PopoverContent
            {...POPOVER_CONTENT_STYLES}
            sx={{
               animation: 'fadeUp 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards',
               '@keyframes fadeUp': {
                  '0%': {
                     opacity: 0,
                     transform: 'translateY(12px)'
                  },
                  '100%': {
                     opacity: 1,
                     transform: 'translateY(0px)'
                  }
               }
            }}
         >
            <PopoverHeader {...POPOVER_HEADER_STYLES}>
               {renderSyncStatusTag()}
               {renderActionButton(onClose)}
            </PopoverHeader>
            <PopoverBody {...POPOVER_BODY_STYLES}>
               <VStack align='start' spacing={3} w='full'>
                  <EventWrapperTitle text={event.title} color={event.color} />
                  <EventTimeText start={event.start} end={event.end} />
                  <EventConference conferenceData={event.conferenceData} />
                  <EventLocation location={event.location} />
                  <EventAttendees attendees={event.attendees} />
                  <EventDescription description={event.description} />
                  <EventReminders
                     reminders={event.reminders}
                     eventStart={event.start}
                  />

                  <EventVisibility visibility={event.visibility} />

                  <EventCalendarInfo calendar={event.calendar} />
               </VStack>
            </PopoverBody>
         </PopoverContent>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
EventPreview.displayName = 'EventPreview'

// PropTypes validation
EventPreview.propTypes = {
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
      color: PropTypes.string,
      description: PropTypes.string,
      location: PropTypes.shape({
         raw: PropTypes.string,
         displayName: PropTypes.string,
         address: PropTypes.string
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
         id: PropTypes.string,
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
   removeTaskScheduleSlotAction: PropTypes.func.isRequired,
   showTaskModalAction: PropTypes.func.isRequired,
   showEventEditModalAction: PropTypes.func.isRequired,
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
   removeTaskScheduleSlotAction,
   showTaskModalAction,
   showEventEditModalAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(EventPreview)
