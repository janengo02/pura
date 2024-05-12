import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask, showTaskModal } from '../../../../actions/task'
import { PiTrash } from 'react-icons/pi'
import { Flex, IconButton, Image, Input, useToast } from '@chakra-ui/react'
import t from '../../../../lang/i18n'
import cloneDeep from 'clone-deep'
import { stringToDateTimeLocal } from '../../../../utils/formatter'
import { createGoogleCalendarEvent } from '../../../../actions/googleAccount'
import useLoading from '../../../../hooks/useLoading'

import { useGoogleLogin } from '@react-oauth/google'
import { createGoogleTokens } from '../../../../actions/googleAccount'

const ScheduleTimeSlot = ({
   isLoggedIn,
   updateTask,
   showTaskModal,
   createGoogleCalendarEvent,
   createGoogleTokens,
   task: { task },
   slot,
   index,
   state
}) => {
   const googleLogin = useGoogleLogin({
      onSuccess: async (tokenResponse) => {
         const { code } = tokenResponse
         await createGoogleTokens({ code })
         addGoogleCalendarEvent(index)
      },
      // TODO Error Handling
      onError: (responseError) => {
         console.log('onError', responseError)
      },
      onNonOAuthError: (responseError) => {
         console.log('onNonOAuthError', responseError)
      },
      scope: 'openid email profile https://www.googleapis.com/auth/calendar',
      flow: 'auth-code',
      auto_select: true
   })
   const toast = useToast()
   const onUpdateFrom = async (newFrom, index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule[index].start = newFrom
      // TODO: CHeck if end time is bigger than start time
      const formData = {
         page_id: state._id,
         task_id: task._id,
         schedule: newSchedule
      }
      const newTask = {
         ...task,
         schedule: newSchedule
      }
      await updateTask(formData)
      await showTaskModal(newTask)
   }
   const onUpdateTo = async (newTo, index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule[index].end = newTo
      // TODO: CHeck if end time is bigger than start time

      const formData = {
         page_id: state._id,
         task_id: task._id,
         schedule: newSchedule
      }
      const newTask = {
         ...task,
         schedule: newSchedule
      }
      await updateTask(formData)
      await showTaskModal(newTask)
   }
   const onDelete = async (index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule.splice(index, 1)
      const formData = {
         page_id: state._id,
         task_id: task._id,
         schedule: newSchedule
      }
      const newTask = {
         ...task,
         schedule: newSchedule
      }
      await updateTask(formData)
      await showTaskModal(newTask)
   }
   const onCreateGoogleEvent = async () => {
      const reqData = {
         summary: task.title,
         startDateTime: task.schedule[index].start,
         endDateTime: task.schedule[index].end
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
      <Flex w='full' gap={2}>
         <Input
            title={`start_${index}`}
            size='sm'
            type='datetime-local'
            variant='filled'
            bg='gray.50'
            width='auto'
            fontSize='xs'
            value={stringToDateTimeLocal(slot.start)}
            borderRadius={5}
            onChange={async (e) => {
               e.preventDefault()
               onUpdateFrom(e.target.value, index)
            }}
         />
         -
         <Input
            title={`end_${index}`}
            size='sm'
            type='datetime-local'
            variant='filled'
            bg='gray.50'
            width='auto'
            fontSize='xs'
            value={stringToDateTimeLocal(slot.end)}
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
         <IconButton
            icon={<Image src='assets/img/logos--google-calendar.svg' />}
            variant='ghost'
            colorScheme='gray'
            color='gray.500'
            size='sm'
            isLoading={addGoogleCalendarLoading}
            onClick={async (e) => {
               e.preventDefault()
               if (!isLoggedIn) {
                  googleLogin()
               } else {
                  addGoogleCalendarEvent()
               }
            }}
         />
      </Flex>
   )
}

ScheduleTimeSlot.propTypes = {
   task: PropTypes.object.isRequired,
   updateTask: PropTypes.func.isRequired,
   showTaskModal: PropTypes.func.isRequired,
   createGoogleCalendarEvent: PropTypes.func.isRequired,
   isLoggedIn: PropTypes.bool,
   createGoogleTokens: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   isLoggedIn: state.googleAccount.isLoggedIn
})

export default connect(mapStateToProps, {
   updateTask,
   showTaskModal,
   createGoogleCalendarEvent,
   createGoogleTokens
})(ScheduleTimeSlot)
