import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import { updateProgress } from '../../../../actions/progress'

import { Card, Flex } from '@chakra-ui/react'
import { FormProvider, useForm } from 'react-hook-form'
import { MultiInput } from '../../../../components/MultiInput'
import { dashboardSchema as s } from '../../DashboardSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import t from '../../../../lang/i18n'

const NewProgressHeader = ({ updateProgress, page_id, progress }) => {
   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onBlur = methods.handleSubmit((data) => {
      const formData = {
         page_id: page_id,
         progress_id: progress._id,
         title: data.title
      }
      if (formData.title === '') {
         formData.title = 'Untitled'
      }
      updateProgress(formData)
   })
   return (
      <Card
         variant='filled'
         bg={progress.color}
         paddingLeft={3}
         paddingRight={1}
         w={250}
         h={8}
         justifyContent='center'
      >
         <Flex marginBottom={-2}>
            <FormProvider {...methods} h='fit-content'>
               <form noValidate autoComplete='on'>
                  <MultiInput
                     name='title'
                     type='text'
                     variant='unstyled'
                     placeholder={t('placeholder-task_title')}
                     validation={s.title}
                     onBlur={async (e) => {
                        e.preventDefault()
                        onBlur()
                     }}
                     color='gray.600'
                     fontWeight={600}
                     borderRadius={0}
                     p={0}
                     autoFocus
                  />
               </form>
            </FormProvider>
         </Flex>
      </Card>
   )
}

NewProgressHeader.propTypes = {
   updateProgress: PropTypes.func.isRequired
}

export default connect(null, { updateProgress })(NewProgressHeader)
