import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateGroup } from '../../../../actions/task'
import TaskCardLabel from '../../../../components/typography/TaskCardLabel'
import { PiCalendar, PiPlus } from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { Button, Flex, Input, VStack } from '@chakra-ui/react'
const ScheduleSelect = ({ updateGroup, task: { task }, state }) => {
   return (
      <Flex w='full' gap={3} alignItems='flex-start' paddingTop={1}>
         <TaskCardLabel
            icon={<PiCalendar />}
            paddingTop={1}
            text={t('label-schedule')}
         />

         <VStack w='full' alignItems='flex-start' gap={3}>
            <Flex w='full' gap={3}>
               <Input
                  size='sm'
                  type='datetime-local'
                  variant='filled'
                  bg='gray.50'
                  borderRadius={5}
               />
               -
               <Input
                  size='sm'
                  type='datetime-local'
                  variant='filled'
                  bg='gray.50'
                  borderRadius={5}
               />
            </Flex>
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
   updateGroup: PropTypes.func.isRequired
}
const mapStateToProps = (state) => ({
   task: state.task
})
export default connect(mapStateToProps, { updateGroup })(ScheduleSelect)
