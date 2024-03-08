import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateSchedule } from '../../../../actions/task'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import { PiCalendar, PiPlus } from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { Button, Flex, Input, VStack } from '@chakra-ui/react'
const ScheduleSelect = ({ updateSchedule, task: { task }, state }) => {
   return (
      <Flex w='full' gap={3} alignItems='flex-start' paddingTop={1}>
         <TaskCardLabel
            icon={<PiCalendar />}
            paddingTop={1}
            text={t('label-schedule')}
         />

         <VStack w='full' alignItems='flex-start' gap={3}>
            {task.schedule.map((slot, index) => (
               <Flex w='full' gap={3}>
                  <Input
                     title={`datetime_from_${index}`}
                     size='sm'
                     type='datetime-local'
                     variant='filled'
                     bg='gray.50'
                     value={slot.datetime_from}
                     borderRadius={5}
                  />
                  -
                  <Input
                     title={`datetime_to_${index}`}
                     size='sm'
                     type='datetime-local'
                     variant='filled'
                     bg='gray.50'
                     value={slot.datetime_to}
                     borderRadius={5}
                  />
               </Flex>
            ))}
            <Button
               size='sm'
               colorScheme='gray'
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
   updateSchedule: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task
})
export default connect(mapStateToProps, { updateSchedule })(ScheduleSelect)
