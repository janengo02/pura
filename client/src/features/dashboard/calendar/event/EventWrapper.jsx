import React, { useRef } from 'react'

import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
   IconButton,
   Popover,
   PopoverBody,
   PopoverContent,
   PopoverHeader,
   PopoverTrigger
} from '@chakra-ui/react'
import { PiPencilLine, PiTrash } from 'react-icons/pi'
import { deleteGoogleCalendarEvent } from '../../../../actions/googleAccount'
import useLoading from '../../../../hooks/useLoading'

const EventWrapper = ({
   children,
   event,
   // Redux props
   page: { page },
   deleteGoogleCalendarEvent
}) => {
   const initRef = useRef()
   const taskIndex = page.tasks.findIndex((t) =>
      t.google_events.includes(event.id)
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

   return (
      <Popover placement='auto' isLazy initialFocusRef={initRef}>
         {({ isOpen, onClose }) => (
            <>
               <PopoverTrigger>{children}</PopoverTrigger>
               <PopoverContent boxShadow='md'>
                  <PopoverHeader
                     display='flex'
                     justifyContent='flex-end'
                     paddingX={1}
                     paddingTop={1}
                     paddingBottom={0}
                     border='none'
                  >
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
                     {event.title}
                     {taskId}___
                     {gEventIndex}
                  </PopoverBody>
               </PopoverContent>
            </>
         )}
      </Popover>
   )
}
EventWrapper.propTypes = {
   page: PropTypes.object.isRequired,
   deleteGoogleCalendarEvent: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
   page: state.page
})

export default connect(mapStateToProps, { deleteGoogleCalendarEvent })(
   EventWrapper
)
