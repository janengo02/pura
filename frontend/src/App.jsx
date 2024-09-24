import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Register from './features/register/Register'
import Login from './features/login/Login'
import PasswordRecover from './features/login/PasswordRecover'
import Landing from './features/landing/Landing'
import Dashboard from './features/dashboard/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import NotFound from './components/errorHandler/NotFound'
import ServerError from './components/errorHandler/ServerError'

import { GoogleOAuthProvider } from '@react-oauth/google'

// Redux
import { Provider } from 'react-redux'
import store from './store'
import { setAuthToken } from './utils'
import { loadUser } from './actions/auth'
import { LOGOUT } from './actions/types'

// Style
import './App.css'
import { ChakraProvider } from '@chakra-ui/react'
import { googleAuthClientId } from './config/env'

const App = () => {
   useEffect(() => {
      // check for token in LS when app first runs
      if (localStorage.token) {
         // if there is a token set axios headers for all requests
         setAuthToken(localStorage.token)
      }
      // try to fetch a user, if no token or invalid token we
      // will get a 401 response from our API
      store.dispatch(loadUser())

      // log user out from all tabs if they log out in one tab
      window.addEventListener('storage', () => {
         if (!localStorage.token) store.dispatch({ type: LOGOUT })
      })
   }, [])

   return (
      <GoogleOAuthProvider clientId={googleAuthClientId}>
         <Provider store={store}>
            <ChakraProvider
               toastOptions={{
                  defaultOptions: {
                     position: 'top',
                     duration: 2000,
                     variant: 'subtle',
                     isClosable: true
                  }
               }}
            >
               <Router>
                  <Routes>
                     <Route path='/' element={<Landing />} />
                     <Route path='register' element={<Register />} />
                     <Route path='login' element={<Login />} />
                     <Route path='recover' element={<PasswordRecover />} />
                     <Route path='error' element={<ServerError />} />
                     <Route
                        path='dashboard'
                        element={<PrivateRoute component={Dashboard} />}
                     />
                     <Route path='/*' element={<NotFound />} />
                  </Routes>
               </Router>
            </ChakraProvider>
         </Provider>
      </GoogleOAuthProvider>
   )
}
export default App
