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
import { loginSchema as s } from './LoginSchema'
import { yupResolver } from '@hookform/resolvers/yup'
import t from '../../lang/i18n'
import { loginAction } from '../../actions/authActions'
import PropTypes from 'prop-types'
import FormAlert from '../../components/errorHandler/FormAlert'

const Login = ({ isLoading, loginAction, isAuthenticated }) => {
   const methods = useForm({
      resolver: yupResolver(s)
   })

   const onSubmit = methods.handleSubmit((data) => {
      const { email, password } = data
      loginAction({ email, password })
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
               spacing={10}
               alignItems='flex-start'
               bg='gray.50'
               justifyContent='center'
            ></VStack>
            <VStack
               w='full'
               h='full'
               p={10}
               spacing={8}
               alignItems='flex-start'
               justifyContent='center'
            >
               <VStack spacing={5} alignItems='flex-start'>
                  <Heading size='2xl'>{t('title-login')}</Heading>
                  <Text>{t('desc-login')}</Text>
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
                        {/* TODO: "Remember me" */}
                        <GridItem colSpan={1}>
                           <Button
                              size='lg'
                              w='full'
                              colorScheme='purple'
                              isLoading={isLoading}
                              loadingText={t('btn-submitting')}
                              type='submit'
                           >
                              {t('btn-login')}
                           </Button>
                        </GridItem>
                        <GridItem colSpan={1}>
                           <Text color='gray.500'>
                              {t('guide-create_account')}
                              <Link to='/register' text={t('guide-register')} />
                           </Text>
                        </GridItem>
                     </SimpleGrid>
                  </form>
               </FormProvider>
            </VStack>
         </Flex>
      </Container>
   )
}

Login.propTypes = {
   isLoading: PropTypes.bool.isRequired,
   loginAction: PropTypes.func.isRequired,
   isAuthenticated: PropTypes.bool
}

const mapStateToProps = (state) => ({
   isLoading: state.loading,
   isAuthenticated: state.auth.isAuthenticated
})

export default connect(mapStateToProps, { loginAction })(Login)
