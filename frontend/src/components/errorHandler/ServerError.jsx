import React from 'react'
import { Button, Container, Link, Text, VStack } from '@chakra-ui/react'
import { Link as ReactRouterLink, useLocation } from 'react-router-dom'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

const ServerError = ({ auth: { isAuthenticated } }) => {
   const { t } = useReactiveTranslation()
   const location = useLocation()
   const { code, msg } = location.state
   return (
      <Container maxW='container.xl' p={0}>
         <VStack
            w='full'
            h='full'
            p={10}
            spacing={10}
            alignItems='center'
            justifyContent='center'
         >
            <Text color='gray.600'>{code}</Text>
            <Text color='gray.600'>{t(msg)}</Text>

            {isAuthenticated ? (
               <Link as={ReactRouterLink} to='/dashboard'>
                  <Button size='lg' variant='solid'>
                     {t('btn-dashboard-page')}
                  </Button>
               </Link>
            ) : (
               <Link as={ReactRouterLink} to='/login'>
                  <Button size='lg' variant='solid'>
                     {t('btn-login-page')}
                  </Button>
               </Link>
            )}
         </VStack>
      </Container>
   )
}

ServerError.propTypes = {
   auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   auth: state.auth
})

export default connect(mapStateToProps)(ServerError)
