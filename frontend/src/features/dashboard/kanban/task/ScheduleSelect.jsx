import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask } from '../../../../actions/task'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import { PiCalendar, PiPlus } from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { Button, Flex, VStack } from '@chakra-ui/react'
import cloneDeep from 'clone-deep'
import ScheduleTimeSlot from './ScheduleTimeSlot'

const ScheduleSelect = ({
   // Redux props
   updateTask,
   task: { task },
   _id
}) => {
   const addSlot = async () => {
      const newSlot = {
         start: '',
         end: ''
      }
      var newSchedule = cloneDeep(task.schedule)
      newSchedule.push(newSlot)
      const formData = {
         page_id: _id,
         task_id: task._id,
         schedule: newSchedule,
         task_detail_flg: true
      }
      await updateTask(formData)
   }

   return (
      <Flex w='full' gap={3} alignItems='flex-start' paddingTop={1}>
         <TaskCardLabel
            icon={<PiCalendar />}
            paddingTop={1}
            text={t('label-schedule')}
         />

         <VStack w='full' alignItems='flex-start' gap={3}>
            {task?.schedule?.map((slot, index) => (
               <ScheduleTimeSlot key={index} slot={slot} index={index} />
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
   _id: PropTypes.string.isRequired,
   task: PropTypes.object.isRequired,
   page: PropTypes.object.isRequired,
   updateTask: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task,
   _id: state.page._id
})
export default connect(mapStateToProps, {
   updateTask
})(ScheduleSelect)
