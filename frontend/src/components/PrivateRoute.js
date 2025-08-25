import React from 'react'
import { Navigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Spinner } from '@chakra-ui/react'

const PrivateRoute = ({
   isLoading,
   component: Component,
   auth: { isAuthenticated }
}) => {
   if (isLoading) return <Spinner />
   if (!isLoading && isAuthenticated) return <Component />
   return <Navigate to='/login' />
}

PrivateRoute.propTypes = {
   isLoading: PropTypes.bool.isRequired,
   auth: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   isLoading: state.loading.isLoading,
   auth: state.auth
})

export default connect(mapStateToProps)(PrivateRoute)
