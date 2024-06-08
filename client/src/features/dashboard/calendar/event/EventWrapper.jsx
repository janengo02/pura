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
   PopoverTrigger
} from '@chakra-ui/react'
import { PiPencilLine, PiTrash } from 'react-icons/pi'
import { deleteGoogleCalendarEvent } from '../../../../actions/googleAccount'
import useLoading from '../../../../hooks/useLoading'
import EventWrapperTitle from '../../../../components/typography/EventWrapperTitle'
import EventTimeText from './EventTimeText'
import { showTaskModal } from '../../../../actions/task'

const EventWrapper = ({
   children,
   event,
   // Redux props
   page: { page },
   deleteGoogleCalendarEvent,
   showTaskModal
}) => {
   const initRef = useRef()
   const taskIndex = page.tasks.findIndex(
      (t) => t.google_events.includes(event.id) && event.title === t.title
   )

   const taskId = taskIndex !== -1 ? page.tasks[taskIndex]._id : null
   const gEventIndex =
      taskIndex !== -1
         ? page.tasks[taskIndex].google_events.findIndex((g) => g === event.id)
         : null

   const onDelete = async () => {
      const reqData = {
         eventId: event.id,
         pageId: page._id,
         taskId,
         gEventIndex
      }
      await deleteGoogleCalendarEvent(reqData)
   }
   const [deleteEvent, deleteLoading] = useLoading(onDelete)

   const showTask = async () => {
      const formData = {
         page_id: page._id,
         task_id: taskId,
         g_event_index: gEventIndex
      }
      await showTaskModal(formData)
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
                     {taskId && (
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
                     )}

                     <IconButton
                        icon={<PiPencilLine />}
                        variant='ghost'
                        size='sm'
                        colorScheme='gray'
                        onClick={async (e) => {
                           e.preventDefault()
                        }}
                     />
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
                  </PopoverHeader>
                  <PopoverBody>
                     <EventWrapperTitle text={event.title} />
                     <EventTimeText start={event.start} end={event.end} />
                  </PopoverBody>
               </PopoverContent>
            </>
         )}
      </Popover>
   )
}
EventWrapper.propTypes = {
   page: PropTypes.object.isRequired,
   deleteGoogleCalendarEvent: PropTypes.func.isRequired,
   showTaskModal: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
   page: state.page
})

export default connect(mapStateToProps, {
   deleteGoogleCalendarEvent,
   showTaskModal
})(EventWrapper)
