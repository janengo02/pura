import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask, showTaskModal } from '../../../../actions/task'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import { PiCalendar, PiPlus } from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { Button, Flex, VStack } from '@chakra-ui/react'
import cloneDeep from 'clone-deep'
import ScheduleTimeSlot from './ScheduleTimeSlot'

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

   return (
      <Flex w='full' gap={3} alignItems='flex-start' paddingTop={1}>
         <TaskCardLabel
            icon={<PiCalendar />}
            paddingTop={1}
            text={t('label-schedule')}
         />

         <VStack w='full' alignItems='flex-start' gap={3}>
            {task.schedule.map((slot, index) => (
               <ScheduleTimeSlot
                  key={index}
                  slot={slot}
                  index={index}
                  state={state}
               />
            ))}
            <Button
               size='xs'
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
export default connect(mapStateToProps, {
   updateTask,
   showTaskModal
})(ScheduleSelect)
