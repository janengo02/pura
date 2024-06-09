import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask } from '../../../../actions/task'
import { PiTrash } from 'react-icons/pi'
import {
   Flex,
   IconButton,
   Image,
   Input,
   Tooltip,
   useToast
} from '@chakra-ui/react'
import t from '../../../../lang/i18n'
import cloneDeep from 'clone-deep'
import { stringToDateTimeLocal } from '../../../../utils/formatter'
import { createGoogleCalendarEvent } from '../../../../actions/googleAccount'
import useLoading from '../../../../hooks/useLoading'

const ScheduleTimeSlot = ({
   slot,
   index,
   // Redux props
   googleAccount: { googleEvents, isLoggedIn },
   updateTask,
   createGoogleCalendarEvent,
   task: { task },
   page: { page }
}) => {
   const [isSynced, setIsSynced] = useState(true)
   const startTime = stringToDateTimeLocal(slot.start)
   const endTime = stringToDateTimeLocal(slot.end)
   const isViewingCalendarEvent = task.g_event_index === index && isSynced
   const isInvalidTimeSlot =
      startTime === 'Invalid date' ||
      endTime === 'Invalid date' ||
      startTime >= endTime

   useEffect(() => {
      const gEventId = task.google_events[index]
      const createdGoogleEvent = googleEvents.find((g) => g.id === gEventId)
      if (typeof createdGoogleEvent === 'undefined') {
         setIsSynced(false)
      } else if (
         stringToDateTimeLocal(createdGoogleEvent.start) !==
            stringToDateTimeLocal(slot.start) ||
         stringToDateTimeLocal(createdGoogleEvent.end) !==
            stringToDateTimeLocal(slot.end)
      ) {
         setIsSynced(false)
      } else {
         setIsSynced(true)
      }
   }, [task, googleEvents])

   const toast = useToast()
   const onUpdateFrom = async (newFrom, index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule[index].start = newFrom
      const newStartTime = stringToDateTimeLocal(newFrom)
      const isNewInvalidTimeSlot =
         newStartTime === 'Invalid date' ||
         endTime === 'Invalid date' ||
         newStartTime >= endTime

      const formData = {
         page_id: page._id,
         task_id: task._id,
         schedule: newSchedule,
         synced_g_event: !isNewInvalidTimeSlot && isSynced ? index : null,
         task_detail_flg: true
      }
      await updateTask(formData)
   }
   const onUpdateTo = async (newTo, index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule[index].end = newTo
      const newEndTime = stringToDateTimeLocal(newTo)
      const isNewInvalidTimeSlot =
         startTime === 'Invalid date' ||
         newEndTime === 'Invalid date' ||
         startTime >= newEndTime

      const formData = {
         page_id: page._id,
         task_id: task._id,
         schedule: newSchedule,
         synced_g_event: !isNewInvalidTimeSlot && isSynced ? index : null,
         task_detail_flg: true
      }
      await updateTask(formData)
   }
   const onDelete = async (index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule.splice(index, 1)
      var newGoogleEvents = cloneDeep(task.google_events)
      newGoogleEvents.splice(index, 1)
      const formData = {
         page_id: page._id,
         task_id: task._id,
         schedule: newSchedule,
         google_events: newGoogleEvents,
         task_detail_flg: true
      }
      await updateTask(formData)
   }
   const onCreateGoogleEvent = async () => {
      const reqData = {
         target_task: task,
         slot_index: index,
         page_id: page._id
      }
      await createGoogleCalendarEvent(reqData)
      toast({
         title: t('alert-google_calendar-event_created'),
         status: 'success'
      })
      // TODO: Handle Google authentication error
   }
   const [addGoogleCalendarEvent, addGoogleCalendarLoading] =
      useLoading(onCreateGoogleEvent)
   return (
      <Flex w='full' gap={2} color={isInvalidTimeSlot ? 'red.600' : undefined}>
         <Input
            size='sm'
            type='datetime-local'
            variant='filled'
            bg={isViewingCalendarEvent ? 'purple.100' : 'gray.50'}
            width='auto'
            fontSize='xs'
            value={startTime}
            borderRadius={5}
            onChange={async (e) => {
               e.preventDefault()
               onUpdateFrom(e.target.value, index)
            }}
         />
         -
         <Input
            size='sm'
            type='datetime-local'
            variant='filled'
            bg={isViewingCalendarEvent ? 'purple.100' : 'gray.50'}
            width='auto'
            fontSize='xs'
            value={endTime}
            borderRadius={5}
            onChange={async (e) => {
               e.preventDefault()
               onUpdateTo(e.target.value, index)
            }}
         />
         <IconButton
            icon={<PiTrash />}
            variant='ghost'
            colorScheme='gray'
            color='gray.500'
            size='sm'
            onClick={async (e) => {
               e.preventDefault()
               onDelete(index)
            }}
         />
         <Tooltip
            hasArrow
            label={
               isInvalidTimeSlot
                  ? t('tooltip-time_slot-invalid')
                  : t('tooltip-time_slot-sync')
            }
            placement='bottom'
         >
            <IconButton
               icon={
                  <Image
                     src={
                        isSynced
                           ? 'assets/img/logos--google-calendar-synced.svg'
                           : 'assets/img/logos--google-calendar-not-synced.svg'
                     }
                     size={30}
                  />
               }
               variant='ghost'
               colorScheme='gray'
               color='gray.500'
               size='sm'
               isLoading={addGoogleCalendarLoading}
               isDisabled={!isLoggedIn || isInvalidTimeSlot}
               onClick={async (e) => {
                  e.preventDefault()
                  if (!isSynced) {
                     addGoogleCalendarEvent()
                  } else {
                     toast({
                        title: t('alert-google_calendar-event_already_synced'),
                        status: 'info'
                     })
                  }
               }}
            />
         </Tooltip>
      </Flex>
   )
}

ScheduleTimeSlot.propTypes = {
   task: PropTypes.object.isRequired,
   page: PropTypes.object.isRequired,
   updateTask: PropTypes.func.isRequired,
   createGoogleCalendarEvent: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   page: state.page,
   googleAccount: state.googleAccount
})

export default connect(mapStateToProps, {
   updateTask,
   createGoogleCalendarEvent
})(ScheduleTimeSlot)
