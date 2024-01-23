import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateTask } from '../../../../actions/task'

import { Draggable } from 'react-beautiful-dnd'
import { Card, Flex, Text } from '@chakra-ui/react'
import { FormProvider, useForm } from 'react-hook-form'

import { MultiInput } from '../../../../components/MultiInput'
import { dashboardSchema as s } from '../../DashboardSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import t from '../../../../lang/i18n'

const NewTaskCard = ({ page_id, task_id, draggableId, index, updateTask }) => {
   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onBlur = methods.handleSubmit((data) => {
      const formData = {
         page_id: page_id,
         task_id: task_id,
         title: data.title
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      updateTask(formData)
   })

   return (
      <Draggable draggableId={draggableId} index={index}>
         {(provided, snapshot) => (
            <Card
               {...provided.draggableProps}
               {...provided.dragHandleProps}
               ref={provided.innerRef}
               variant='outline'
               boxShadow={snapshot.isDragging ? 'md' : undefined}
               p={2}
               w='full'
               marginBottom={1}
            >
               <Text h={6} fontSize='xs' color='red.500'>
                  {t('schedule_status-false')}
               </Text>
               <Flex h={6} alignItems='center' overflow='hidden'>
                  <FormProvider {...methods} h='fit-content'>
                     <form noValidate autoComplete='on'>
                        <MultiInput
                           name='title'
                           type='text'
                           variant='unstyled'
                           placeholder={t('placeholder-task_title')}
                           validation={s.name}
                           onBlur={async (e) => {
                              e.preventDefault()
                              onBlur()
                           }}
                           color='gray.600'
                           fontWeight={600}
                           borderRadius={0}
                           autoFocus
                        />
                     </form>
                  </FormProvider>
               </Flex>
            </Card>
         )}
      </Draggable>
   )
}

NewTaskCard.propTypes = {
   updateTask: PropTypes.func.isRequired
}

export default connect(null, { updateTask })(NewTaskCard)
