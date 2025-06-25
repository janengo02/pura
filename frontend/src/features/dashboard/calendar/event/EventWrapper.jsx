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
   PopoverTrigger
} from '@chakra-ui/react'

// Icons & Components
import { PiTrash } from 'react-icons/pi'
import EventWrapperTitle from '../../../../components/typography/EventWrapperTitle'
import EventTimeText from './EventTimeText'

// Actions & Hooks
import { deleteEventAction } from '../../../../actions/googleAccountActions'
import { showTaskModalAction } from '../../../../actions/taskActions'
import useLoading from '../../../../hooks/useLoading'

// =============================================================================
// CONSTANTS
// =============================================================================

const BUTTON_STYLES = {
   variant: 'ghost',
   size: 'sm',
   colorScheme: 'gray'
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
      deleteEventAction,
      showTaskModalAction,
      eventData: { pageId, tasks, googleAccounts }
   }) => {
      // -------------------------------------------------------------------------
      // REFS & STATE
      // -------------------------------------------------------------------------

      const initRef = useRef()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const taskId = useMemo(
         () =>
            typeof event.pura_schedule_index !== 'undefined' ? event.id : null,
         [event.id, event.pura_schedule_index]
      )

      const isPuraTask = useMemo(() => taskId !== null, [taskId])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleDelete = useCallback(async () => {
         const reqData = {
            eventId: event.id,
            calendarId: event.calendarId,
            accountId: event.accountId
         }
         await deleteEventAction(reqData)
      }, [deleteEventAction, event.id, event.calendarId, event.accountId])

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
         if (isPuraTask) {
            return (
               <IconButton
                  icon={
                     <Image
                        src='assets/img/pura-logo-icon.svg'
                        size={30}
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

         return (
            <IconButton
               icon={<PiTrash />}
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
      pura_schedule_index: PropTypes.number
   }).isRequired,
   deleteEventAction: PropTypes.func.isRequired,
   showTaskModalAction: PropTypes.func.isRequired,
   eventData: PropTypes.shape({
      pageId: PropTypes.string.isRequired,
      tasks: PropTypes.array.isRequired,
      googleAccounts: PropTypes.array.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectEventWrapperData = createSelector(
   [
      (state) => state.page._id,
      (state) => state.page.tasks,
      (state) => state.googleAccount.googleAccounts
   ],
   (_id, tasks, googleAccounts) => ({
      pageId: _id,
      tasks: tasks || [],
      googleAccounts: googleAccounts || []
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   eventData: selectEventWrapperData(state)
})

const mapDispatchToProps = {
   deleteEventAction,
   showTaskModalAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(EventWrapper)
