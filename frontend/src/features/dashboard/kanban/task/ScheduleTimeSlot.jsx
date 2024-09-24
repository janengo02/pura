import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask } from '../../../../actions/task'
import { PiCalendarFill, PiTrash } from 'react-icons/pi'
import { Flex, IconButton, Input, Tooltip } from '@chakra-ui/react'
import t from '../../../../lang/i18n'
import cloneDeep from 'clone-deep'
import { stringToDateTimeLocal } from '../../../../utils/formatter'
import useLoading from '../../../../hooks/useLoading'

const ScheduleTimeSlot = ({
   slot,
   index,
   // Redux props
   updateTask,
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
            icon={<PiTrash size={16} />}
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
            label={t('tooltip-time_slot-view_calendar')}
            placement='bottom'
         >
            <IconButton
               icon={<PiCalendarFill size={16} />}
               variant='ghost'
               colorScheme='gray'
               color='gray.500'
               size='sm'
               isDisabled={isInvalidTimeSlot}
               onClick={async (e) => {
                  e.preventDefault()
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
   createGoogleCalendarEvent: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   _id: state.page._id
})

export default connect(mapStateToProps, {
   updateTask
})(ScheduleTimeSlot)
