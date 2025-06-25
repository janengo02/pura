import React, { useRef } from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
   IconButton,
   Image,
   Popover,
   PopoverBody,
   PopoverContent,
   PopoverHeader,
   PopoverTrigger,
   Text
} from '@chakra-ui/react'
import { PiPencilLine, PiTrash } from 'react-icons/pi'
import { deleteEventAction } from '../../../../actions/googleAccountActions'
import useLoading from '../../../../hooks/useLoading'
import EventWrapperTitle from '../../../../components/typography/EventWrapperTitle'
import EventTimeText from './EventTimeText'
import { showTaskModalAction } from '../../../../actions/taskActions'

const EventWrapper = ({
   children,
   event,
   // Redux props
   deleteEventAction,
   showTaskModalAction,
   _id,
   googleAccounts
}) => {
   const initRef = useRef()
   const taskId =
      typeof event.pura_schedule_index !== 'undefined' ? event.id : null
   const onDelete = async () => {
      const reqData = {
         eventId: event.id,
         calendarId: event.calendarId,
         accountId: event.accountId
      }
      await deleteEventAction(reqData)
   }
   const [deleteEvent, deleteLoading] = useLoading(onDelete)

   const showTask = async () => {
      const formData = {
         page_id: _id,
         task_id: taskId,
         target_event_index: event.pura_schedule_index
      }
      await showTaskModalAction(formData)
   }
   return (
      <Popover placement='auto' isLazy initialFocusRef={initRef}>
         {({ isOpen, onClose }) => (
            <>
               <PopoverTrigger>{children}</PopoverTrigger>
               <PopoverContent boxShadow='md' minW='max-content'>
                  <PopoverHeader
                     display='flex'
                     justifyContent='flex-end'
                     paddingX={1}
                     paddingTop={1}
                     paddingBottom={0}
                     border='none'
                  >
                     {taskId ? (
                        <IconButton
                           icon={
                              <Image
                                 src='assets/img/pura-logo-icon.svg'
                                 size={30}
                              />
                           }
                           variant='ghost'
                           size='sm'
                           colorScheme='gray'
                           onClick={async (e) => {
                              e.preventDefault()
                              showTask()
                           }}
                        />
                     ) : (
                        <>
                           <IconButton
                              icon={<PiTrash />}
                              variant='ghost'
                              size='sm'
                              colorScheme='gray'
                              ref={initRef}
                              isLoading={deleteLoading}
                              onClick={async (e) => {
                                 e.preventDefault()
                                 await deleteEvent()
                                 onClose()
                              }}
                           />
                        </>
                     )}
                  </PopoverHeader>
                  <PopoverBody>
                     <EventWrapperTitle text={event.title} />
                     <EventTimeText start={event.start} end={event.end} />
                     {event.calendar}
                  </PopoverBody>
               </PopoverContent>
            </>
         )}
      </Popover>
   )
}

EventWrapper.propTypes = {
   deleteEventAction: PropTypes.func.isRequired,
   showTaskModalAction: PropTypes.func.isRequired,

   _id: PropTypes.string.isRequired,
   tasks: PropTypes.array.isRequired,
   googleAccounts: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
   _id: state.page._id,
   tasks: state.page.tasks,
   googleAccounts: state.googleAccount.googleAccounts
})

export default connect(mapStateToProps, {
   deleteEventAction,
   showTaskModalAction
})(EventWrapper)
