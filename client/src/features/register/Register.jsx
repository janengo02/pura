import { connect } from 'react-redux'
import { Navigate } from 'react-router-dom'

import {
   Container,
   Flex,
   GridItem,
   Heading,
   SimpleGrid,
   Text,
   VStack,
   Button
} from '@chakra-ui/react'
import { MultiInput } from '../../components/MultiInput'
import Link from '../../components/typography/Link'
import { FormProvider, useForm } from 'react-hook-form'
import { registerSchema as s } from './RegisterSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import t from '../../lang/i18n'
import { register } from '../../actions/auth'
import PropTypes from 'prop-types'
import FormAlert from '../../components/FormAlert'

const Register = ({ isLoading, register, isAuthenticated }) => {
   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onSubmit = methods.handleSubmit((data) => {
      const { name, email, password } = data
      // TODO: Send email confirmation email
      register({ name, email, password })
   })

   if (isAuthenticated) {
      return <Navigate to='/dashboard' />
   }

   return (
      <Container maxW='container.xl' p={0}>
         <Flex minH='100vh' alignItems='center'>
            <VStack
               w='full'
               h='full'
               p={10}
               spacing={8}
               alignItems='flex-start'
               justifyContent='center'
            >
               <VStack spacing={5} alignItems='flex-start'>
                  <Heading size='2xl'>{t('title-register')}</Heading>
                  <Text>{t('desc-register')}</Text>
               </VStack>
               <FormProvider {...methods}>
                  <form
                     onSubmit={async (e) => {
                        e.preventDefault()
                        onSubmit()
                     }}
                     noValidate
                     autoComplete='on'
                     style={{ width: '100%' }}
                  >
                     <SimpleGrid columns={1} rowGap={6} w='full'>
                        <GridItem colSpan={1}>
                           <FormAlert />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <MultiInput
                              name='name'
                              type='text'
                              label={t('label-name')}
                              placeholder={t('placeholder-name')}
                              validation={s.name}
                              size='lg'
                              required
                           />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <MultiInput
                              name='email'
                              type='text'
                              label={t('label-email')}
                              placeholder={t('placeholder-email')}
                              validation={s.email}
                              size='lg'
                              required
                           />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <MultiInput
                              name='password'
                              type='password'
                              label={t('label-password')}
                              helpertext={t('helpertext-password')}
                              validation={s.password}
                              size='lg'
                              required
                           />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <MultiInput
                              name='confirm_password'
                              type='password'
                              label={t('label-confirm_password')}
                              validation={s.confirm_password}
                              size='lg'
                              required
                           />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <Button
                              size='lg'
                              w='full'
                              colorScheme='purple'
                              isLoading={isLoading}
                              loadingText={t('btn-submitting')}
                              type='submit'
                           >
                              {t('btn-register')}
                           </Button>
                        </GridItem>
                        <GridItem colSpan={1}>
                           <Text color='gray.500'>
                              {t('guide-already_have_account')}
                              <Link to='/login' text={t('guide-login')} />
                           </Text>
                        </GridItem>
                     </SimpleGrid>
                  </form>
               </FormProvider>
            </VStack>
            <VStack
               w='full'
               h='full'
               p={10}
               spacing={10}
               alignItems='flex-start'
               bg='gray.50'
               justifyContent='center'
            ></VStack>
         </Flex>
      </Container>
   )
}

Register.propTypes = {
   isLoading: PropTypes.bool.isRequired,
   register: PropTypes.func.isRequired,
   isAuthenticated: PropTypes.bool
}

const mapStateToProps = (state) => ({
   isLoading: state.loading,
   isAuthenticated: state.auth.isAuthenticated
})

export default connect(mapStateToProps, { register })(Register)
