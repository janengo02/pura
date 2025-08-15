// =============================================================================
// IMPORTS
// =============================================================================

// React & Router
import React, { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'

// Components
import Register from './features/register/Register'
import Login from './features/login/Login'
import PasswordRecover from './features/login/PasswordRecover'
import Landing from './features/landing/Landing'
import Terms from './features/landing/Terms'
import Dashboard from './features/dashboard/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import ErrorPage from './features/error/ErrorPage'

// External Libraries
import { GoogleOAuthProvider } from '@react-oauth/google'

// Redux
import { Provider } from 'react-redux'
import store from './store'
import { setAuthToken } from './utils'
import { loadUserAction } from './actions/authActions'
import { initializeLanguageAction } from './actions/languageActions'
import { initializeThemeAction } from './actions/themeActions'
import { LOGOUT } from './actions/types'

// UI & Theme
import { ChakraProvider, ColorModeScript } from '@chakra-ui/react'
import customTheme from './theme/customTheme'

// Styles
import './App.css'

// Config
import { googleAuthClientId } from './config/env'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const App = () => {
   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------

   useEffect(() => {
      // Initialize language and theme first
      store.dispatch(initializeLanguageAction())
      store.dispatch(initializeThemeAction())

      // Check for token in localStorage when app first runs
      if (localStorage.token) {
         // If there is a token set axios headers for all requests
         setAuthToken(localStorage.token)
      }

      // Try to fetch a user, if no token or invalid token we
      // will get a 401 response from our API
      store.dispatch(loadUserAction())

      // Log user out from all tabs if they log out in one tab
      window.addEventListener('storage', () => {
         if (!localStorage.token) store.dispatch({ type: LOGOUT })
      })
   }, [])

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <GoogleOAuthProvider clientId={googleAuthClientId}>
         <Provider store={store}>
            <ColorModeScript
               initialColorMode={customTheme.config.initialColorMode}
            />
            <ChakraProvider
               theme={customTheme}
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
                     <Route path='error' element={<ErrorPage />} />
                     <Route
                        path='dashboard'
                        element={<PrivateRoute component={Dashboard} />}
                     />
                     <Route path='terms' element={<Terms />} />
                     <Route path='/*' element={<ErrorPage />} />
                  </Routes>
               </Router>
            </ChakraProvider>
         </Provider>
      </GoogleOAuthProvider>
   )
}

// =============================================================================
// EXPORT
// =============================================================================

export default App
