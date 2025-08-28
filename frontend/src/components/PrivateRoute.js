import React from 'react'
import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { useLoadUserQuery } from '../api/authApi'
import { Spinner, Center } from '@chakra-ui/react'

const PrivateRoute = ({
   component: Component,
   auth: { isAuthenticated }
}) => {
   const { isLoading } = useLoadUserQuery()

   if (isLoading) {
      return (
         <Center h="100vh">
            <Spinner size="xl" />
         </Center>
      )
   }

   if (isAuthenticated) return <Component />
   return <Navigate to='/login' />
}

PrivateRoute.propTypes = {
   auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   auth: state.auth
})

export default connect(mapStateToProps)(PrivateRoute)
