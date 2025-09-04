import React from 'react'
import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useLoadUserQuery } from '../api/authApi'
import { Spinner, Center } from '@chakra-ui/react'
import { createSelector } from 'reselect'


// =============================================================================
// SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectAuthData = createSelector(
   [(state) => state.auth],
   (auth) => ({
      isAuthenticated: auth?.isAuthenticated || false,
      token: auth?.token || null
   })
)

const PrivateRoute = ({
   component: Component,
}) => {
   const { isAuthenticated, token } = useSelector(selectAuthData)

   // Skip loading user if no token exists (user is logged out)
   const { isLoading } = useLoadUserQuery(undefined, {
      skip: !token
   })

   // Show loading only when we have a token and are loading
   if (isLoading && token) {
      return (
         <Center h="100vh">
            <Spinner size="xl" />
         </Center>
      )
   }

   if (isAuthenticated) return <Component />
   return <Navigate to='/login' />
}

export default PrivateRoute
