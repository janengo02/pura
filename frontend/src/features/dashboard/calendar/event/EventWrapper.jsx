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
   VStack
} from '@chakra-ui/react'

// Icons & Components
import { PiTrash } from 'react-icons/pi'

// Event Components
import EventWrapperTitle from './EventWrapperTitle'
import EventTimeText from './EventTimeText'
import EventDescription from './EventDescription'
import EventLocation from './EventLocation'
import EventConference from './EventConference'
import EventAttendees from './EventAttendees'
import EventReminders from './EventReminders'
import EventVisibility from './EventVisibility'
import EventCalendarInfo from './EventCalendarInfo'

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
            fallbackPlacements: ['top', 'bottom', 'right', 'left']
         }
      },
      {
         name: 'zIndex',
         options: {
            zIndex: 10000
         }
      }
   ]
}

const POPOVER_CONTENT_STYLES = {
   boxShadow: 'md',
   w: '400px',
   maxH: '80vh',
   overflow: 'hidden',
   zIndex: 10000,
   position: 'relative'
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

const POPOVER_BODY_STYLES = {
   p: 4,
   maxW: '100%',
   maxH: 'calc(80vh - 60px)',
   overflowY: 'auto'
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

      // -------------------------------------------------------------------------
      // REFS & STATE
      // -------------------------------------------------------------------------

      const initRef = useRef()

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

      const handleOpenGoogleEvent = () => {
         if (event.htmlLink) {
            window.open(event.htmlLink, '_blank')
         }
      }
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
                  onClick={handleOpenGoogleEvent}
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

      const renderPopoverContent = (onClose) => (
         <PopoverContent {...POPOVER_CONTENT_STYLES} className="event-wrapper-popover">
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
