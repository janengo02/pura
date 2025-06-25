// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// Form Handling
import { FormProvider, useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

// UI Components
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

// Internal Components
import { MultiInput } from '../../components/MultiInput'
import Link from '../../components/typography/Link'
import FormAlert from '../../components/errorHandler/FormAlert'

// Actions & Schema
import { registerAction } from '../../actions/authActions'
import { registerSchema as s } from './RegisterSchema'

// Utils
import t from '../../lang/i18n'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Register = React.memo(
   ({ registerAction, authData: { isLoading, isAuthenticated } }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------

      const methods = useForm({
         resolver: yupResolver(s)
      })

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const formConfig = useMemo(
         () => ({
            onSubmit: methods.handleSubmit((data) => {
               const { name, email, password } = data
               // TODO: Send email confirmation email
               registerAction({ name, email, password })
            })
         }),
         [methods, registerAction]
      )

      // -------------------------------------------------------------------------
      // RENDER LOGIC
      // -------------------------------------------------------------------------

      // Early return for authenticated users
      if (isAuthenticated) {
         return <Navigate to='/dashboard' />
      }

      // -------------------------------------------------------------------------
      // UTIL COMPONENTS
      // -------------------------------------------------------------------------

      const RegisterForm = () => (
         <FormProvider {...methods}>
            <form
               onSubmit={async (e) => {
                  e.preventDefault()
                  formConfig.onSubmit()
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
      )

      const RegisterHeader = () => (
         <VStack spacing={5} alignItems='flex-start'>
            <Heading size='2xl'>{t('title-register')}</Heading>
            <Text>{t('desc-register')}</Text>
         </VStack>
      )

      // -------------------------------------------------------------------------
      // MAIN RENDER
      // -------------------------------------------------------------------------

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
                  <RegisterHeader />
                  <RegisterForm />
               </VStack>

               <VStack
                  w='full'
                  h='full'
                  p={10}
                  spacing={10}
                  alignItems='flex-start'
                  bg='gray.50'
                  justifyContent='center'
               />
            </Flex>
         </Container>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Register.displayName = 'Register'

// PropTypes validation
Register.propTypes = {
   registerAction: PropTypes.func.isRequired,
   authData: PropTypes.shape({
      isLoading: PropTypes.bool.isRequired,
      isAuthenticated: PropTypes.bool
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectAuthData = createSelector(
   [(state) => state.loading, (state) => state.auth.isAuthenticated],
   (isLoading, isAuthenticated) => ({
      isLoading,
      isAuthenticated
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   authData: selectAuthData(state)
})

const mapDispatchToProps = {
   registerAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Register)
