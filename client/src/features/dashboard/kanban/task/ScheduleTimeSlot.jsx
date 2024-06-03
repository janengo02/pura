import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask } from '../../../../actions/task'
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
   slot,
   index,
   // Redux props
   googleAccount: { googleEvents, isLoggedIn },
   updateTask,
   createGoogleCalendarEvent,
   createGoogleTokens,
   task: { task },
   page: { page }
}) => {
   const [isSynced, setIsSynced] = useState(true)
   useEffect(() => {
      const gEventId = task.google_events[index]
      const createdGoogleEvent = googleEvents.find((g) => g.id === gEventId)
      if (typeof createdGoogleEvent === 'undefined') {
         setIsSynced(false)
      } else if (
         stringToDateTimeLocal(createdGoogleEvent.start) !==
            stringToDateTimeLocal(slot.start) ||
         stringToDateTimeLocal(createdGoogleEvent.end) !==
            stringToDateTimeLocal(slot.end) ||
         createdGoogleEvent.title !== task.title
      ) {
         setIsSynced(false)
      } else {
         setIsSynced(true)
      }
   }, [task, googleEvents])
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
         target_task: task,
         page_id: page._id,
         task_id: task._id,
         schedule: newSchedule
      }
      await updateTask(formData)
   }
   const onUpdateTo = async (newTo, index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule[index].end = newTo
      // TODO: CHeck if end time is bigger than start time

      const formData = {
         target_task: task,
         page_id: page._id,
         task_id: task._id,
         schedule: newSchedule
      }
      await updateTask(formData)
   }
   const onDelete = async (index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule.splice(index, 1)
      var newGoogleEvents = cloneDeep(task.google_events)
      newGoogleEvents.splice(index, 1)
      const formData = {
         target_task: task,
         page_id: page._id,
         task_id: task._id,
         schedule: newSchedule,
         google_events: newGoogleEvents
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
   page: PropTypes.object.isRequired,
   updateTask: PropTypes.func.isRequired,
   createGoogleCalendarEvent: PropTypes.func.isRequired,
   createGoogleTokens: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   page: state.page,
   googleAccount: state.googleAccount
})

export default connect(mapStateToProps, {
   updateTask,
   createGoogleCalendarEvent,
   createGoogleTokens
})(ScheduleTimeSlot)
