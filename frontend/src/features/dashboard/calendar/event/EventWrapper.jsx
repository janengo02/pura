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
   HStack
} from '@chakra-ui/react'

// Icons & Components
import { PiTrash } from 'react-icons/pi'
import EventWrapperTitle from '../../../../components/typography/EventWrapperTitle'
import EventTimeText from './EventTimeText'

// Actions & Hooks
import { deleteGoogleEventAction } from '../../../../actions/googleAccountActions'
import { showTaskModalAction } from '../../../../actions/taskActions'
import useLoading from '../../../../hooks/useLoading'

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
   isLazy: true
}

const POPOVER_CONTENT_STYLES = {
   boxShadow: 'md',
   minW: 'max-content'
}

const POPOVER_HEADER_STYLES = {
   display: 'flex',
   justifyContent: 'flex-end',
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
            accountId: event.accountId
         }
         await deleteGoogleEventAction(reqData)
      }, [deleteGoogleEventAction, event.id, event.calendarId, event.accountId])

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

      const renderPopoverContent = (onClose) => (
         <PopoverContent {...POPOVER_CONTENT_STYLES}>
            <PopoverHeader {...POPOVER_HEADER_STYLES}>
               {renderActionButton(onClose)}
            </PopoverHeader>
            <PopoverBody>
               <EventWrapperTitle text={event.title} />
               <EventTimeText start={event.start} end={event.end} />
               {event.calendar}
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
      accountId: PropTypes.string,
      eventType: PropTypes.oneOf(['task', 'google', 'synced']).isRequired,
      pura_task_id: PropTypes.string,
      pura_schedule_index: PropTypes.number
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
