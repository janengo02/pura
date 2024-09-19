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
   googleAccount: { isLoggedIn },
   updateTask,
   createGoogleCalendarEvent,
   task: { task },
   _id
}) => {
   const startTime = stringToDateTimeLocal(slot.start)
   const endTime = stringToDateTimeLocal(slot.end)
   const isViewingCalendarEvent = task.target_event_index === index
   const isInvalidTimeSlot =
      startTime === 'Invalid date' ||
      endTime === 'Invalid date' ||
      startTime >= endTime

   const toast = useToast()
   const onUpdateFrom = async (newFrom) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule[index].start = newFrom

      const formData = {
         page_id: _id,
         task_id: task._id,
         schedule: newSchedule,
         task_detail_flg: true
      }
      await updateTask(formData)
   }
   const onUpdateTo = async (newTo) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule[index].end = newTo

      const formData = {
         page_id: _id,
         task_id: task._id,
         schedule: newSchedule,
         task_detail_flg: true
      }
      await updateTask(formData)
   }
   const onDelete = async () => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule.splice(index, 1)
      const formData = {
         page_id: _id,
         task_id: task._id,
         schedule: newSchedule,
         task_detail_flg: true
      }
      await updateTask(formData)
   }
   const onCreateGoogleEvent = async () => {
      const reqData = {
         target_task: task,
         slot_index: index,
         page_id: _id
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
   const [deleteEvent, deleteEventLoading] = useLoading(onDelete)
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
               onUpdateFrom(e.target.value)
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
               onUpdateTo(e.target.value)
            }}
         />
         <IconButton
            icon={<PiTrash />}
            variant='ghost'
            colorScheme='gray'
            color='gray.500'
            size='sm'
            isLoading={deleteEventLoading}
            onClick={async (e) => {
               e.preventDefault()
               deleteEvent()
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
                     src={'assets/img/logos--google-calendar-synced.svg'}
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
                  addGoogleCalendarEvent()
               }}
            />
         </Tooltip>
      </Flex>
   )
}

ScheduleTimeSlot.propTypes = {
   task: PropTypes.object.isRequired,
   _id: PropTypes.string.isRequired,
   updateTask: PropTypes.func.isRequired,
   createGoogleCalendarEvent: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   _id: state.page._id,
   googleAccount: state.googleAccount
})

export default connect(mapStateToProps, {
   updateTask,
   createGoogleCalendarEvent
})(ScheduleTimeSlot)
