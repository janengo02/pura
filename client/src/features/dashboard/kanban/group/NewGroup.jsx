import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { Flex, VStack } from '@chakra-ui/react'
import Column from '../progress/Column'
import { FormProvider, useForm } from 'react-hook-form'
import { MultiInput } from '../../../../components/MultiInput'
import { yupResolver } from '@hookform/resolvers/yup'
import { dashboardSchema as s } from '../../DashboardSchema'
import { updateGroup } from '../../../../actions/group'
import t from '../../../../lang/i18n'

const NewGroup = ({
   group,
   i_group,
   state,
   // Redux props
   updateGroup
}) => {
   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onBlur = methods.handleSubmit((data) => {
      const formData = {
         page_id: state._id,
         group_id: group._id,
         title: data.title
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      updateGroup(formData)
   })
   return (
      <VStack
         p={3}
         paddingTop={2}
         gap={0}
         borderWidth={2}
         borderColor='gray.100'
         borderRadius={8}
         alignItems='flex-start'
      >
         <FormProvider {...methods} h='fit-content'>
            <form noValidate autoComplete='on'>
               <MultiInput
                  name='title'
                  type='text'
                  variant='unstyled'
                  placeholder={t('placeholder-group_title')}
                  validation={s.title}
                  onBlur={async (e) => {
                     e.preventDefault()
                     onBlur()
                  }}
                  color={group.color}
                  fontWeight={600}
                  borderRadius={0}
                  autoFocus
               />
            </form>
         </FormProvider>
         <Flex gap={3}>
            {state?.progress_order?.map((progress, i_progress) => {
               const i_task_map =
                  i_group * state.progress_order.length + i_progress
               var taskArray = []

               return (
                  <Column
                     key={i_task_map} //has to match droppableId
                     droppableId={i_task_map.toString()}
                     taskPointer={state.task_map[i_task_map] - taskArray.length}
                     progress={progress}
                     group={group}
                     i_progress={i_progress}
                     i_group={i_group}
                     tasks={taskArray}
                     state={state}
                  />
               )
            })}
         </Flex>
      </VStack>
   )
}

NewGroup.propTypes = {
   updateGroup: PropTypes.func.isRequired
}

export default connect(null, { updateGroup })(NewGroup)
