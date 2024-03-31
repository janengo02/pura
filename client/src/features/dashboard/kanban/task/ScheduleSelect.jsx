import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask, showTaskModal } from '../../../../actions/task'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import { PiCalendar, PiPlus, PiTrash } from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { Button, Flex, IconButton, Input, VStack } from '@chakra-ui/react'
import cloneDeep from 'clone-deep'
import { stringToDateTimeLocal } from '../../../../utils/formatter'

const ScheduleSelect = ({
   updateTask,
   showTaskModal,
   task: { task },
   state
}) => {
   const addSlot = async () => {
      const newSlot = {
         start: '',
         end: ''
      }
      var newSchedule = cloneDeep(task.schedule)
      newSchedule.push(newSlot)
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
   const onUpdateFrom = async (newFrom, index) => {
      var newSchedule = cloneDeep(task.schedule)
      newSchedule[index].start = newFrom

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
   return (
      <Flex w='full' gap={3} alignItems='flex-start' paddingTop={1}>
         <TaskCardLabel
            icon={<PiCalendar />}
            paddingTop={1}
            text={t('label-schedule')}
         />

         <VStack w='full' alignItems='flex-start' gap={3}>
            {task.schedule.map((slot, index) => {
               return (
                  <Flex w='full' gap={3} key={index}>
                     <Input
                        title={`start_${index}`}
                        size='sm'
                        type='datetime-local'
                        variant='filled'
                        bg='gray.50'
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
                        value={stringToDateTimeLocal(slot.end)}
                        borderRadius={5}
                        onChange={async (e) => {
                           e.preventDefault()
                           onUpdateTo(e.target.value, index)
                        }}
                     />
                     <IconButton
                        aria-label='Delete schedule slot'
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
                  </Flex>
               )
            })}
            <Button
               size='sm'
               colorScheme='gray'
               onClick={addSlot}
               opacity={0.3}
               variant='ghost'
               leftIcon={<PiPlus />}
            >
               {t('btn-add-schedule')}
            </Button>
         </VStack>
      </Flex>
   )
}

ScheduleSelect.propTypes = {
   task: PropTypes.object.isRequired,
   updateTask: PropTypes.func.isRequired,
   showTaskModal: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task
})
export default connect(mapStateToProps, { updateTask, showTaskModal })(
   ScheduleSelect
)
