import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import { updateTask } from '../../../../actions/taskActions'
import { PiCalendarPlusFill, PiTrash } from 'react-icons/pi'
import {
   Flex,
   IconButton,
   Input,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Tooltip
} from '@chakra-ui/react'
import t from '../../../../lang/i18n'
import cloneDeep from 'clone-deep'
import { stringToDateTimeLocal } from '../../../../utils/formatter'
import useLoading from '../../../../hooks/useLoading'
import { createGoogleEvent } from '../../../../actions/googleAccountActions'

const ScheduleTimeSlot = ({
   slot,
   index,
   // Redux props
   updateTask,
   task: { task },
   _id,
   googleAccounts,
   createGoogleEvent
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
            <Menu isLazy closeOnSelect={false}>
               <MenuButton
                  as={IconButton}
                  icon={<PiCalendarPlusFill size={16} />}
                  variant='ghost'
                  colorScheme='gray'
                  color='gray.500'
                  size='sm'
               ></MenuButton>
               <MenuList zIndex={10}>
                  {googleAccounts.map((account) => {
                     return (
                        <MenuItem
                           key={account._id}
                           display='flex'
                           justifyContent='space-between'
                           alignItems='center'
                           gap={1}
                           fontSize='xs'
                           onClick={async (e) => {
                              e.preventDefault()
                              createGoogleEvent({
                                 target_task: task,
                                 slot_index: index,
                                 page_id: _id,
                                 account_id: account.accountId
                              })
                           }}
                        >
                           {account.accountEmail}
                        </MenuItem>
                     )
                  })}
               </MenuList>
            </Menu>
         </Tooltip>
      </Flex>
   )
}

ScheduleTimeSlot.propTypes = {
   task: PropTypes.object.isRequired,
   _id: PropTypes.string.isRequired,
   updateTask: PropTypes.func.isRequired,
   createGoogleEvent: PropTypes.func.isRequired,
   googleAccounts: PropTypes.array.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   _id: state.page._id,
   googleAccounts: state.googleAccount.googleAccounts
})

export default connect(mapStateToProps, {
   updateTask,
   createGoogleEvent
})(ScheduleTimeSlot)
