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
   Button,
   Box
} from '@chakra-ui/react'

// Internal Components
import { MultiInput } from '../../components/MultiInput'
import Link from '../../components/typography/Link'
import FormAlert from '../../components/errorHandler/FormAlert'
import LanguageSwitcher from '../../components/LanguageSwitcher'

// Actions & Schema
import { loginAction } from '../../actions/authActions'
import { loginSchema as s } from './LoginSchema'

// Utils
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// =============================================================================
// COMPONENT SECTIONS
// =============================================================================

/**
 * Login page header with language switcher
 */
const LoginPageHeader = React.memo(() => (
   <Flex w='full' justifyContent='space-between' alignItems='flex-start' mb={4}>
      <Box flex={1} /> {/* Spacer for center alignment */}
      <LanguageSwitcher />
   </Flex>
))

LoginPageHeader.displayName = 'LoginPageHeader'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Login = React.memo(
   ({ loginAction, authData: { isLoading, isAuthenticated } }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------

      const methods = useForm({
         resolver: yupResolver(s)
      })

      const { t } = useReactiveTranslation()

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const formConfig = useMemo(
         () => ({
            onSubmit: methods.handleSubmit((data) => {
               const { email, password } = data
               loginAction({ email, password })
            })
         }),
         [methods, loginAction]
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

      const LoginForm = () => (
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
                     <Text color='gray.600'>
                        {t('guide-create_account')}
                        <Link to='/register' text={t('guide-register')} />
                     </Text>
                  </GridItem>
               </SimpleGrid>
            </form>
         </FormProvider>
      )

      const LoginHeader = () => (
         <VStack spacing={5} alignItems='flex-start'>
            <Heading size='2xl'>{t('title-login')}</Heading>
            <Text>{t('desc-login')}</Text>
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
                  spacing={10}
                  alignItems='flex-start'
                  bg='gray.50'
                  justifyContent='center'
               />

               <VStack
                  w='full'
                  h='full'
                  p={10}
                  spacing={8}
                  alignItems='flex-start'
                  justifyContent='center'
               >
                  <LoginPageHeader />
                  <LoginHeader />
                  <LoginForm />
               </VStack>
            </Flex>
         </Container>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Login.displayName = 'Login'

// PropTypes validation
Login.propTypes = {
   loginAction: PropTypes.func.isRequired,
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
   loginAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Login)
