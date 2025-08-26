// =============================================================================
// IMPORTS
// =============================================================================

// React & Router
import React, { useEffect } from 'react'
import {
   BrowserRouter as Router,
   Route,
   Routes,
   useLocation
} from 'react-router-dom'

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
import { loadUser } from './reducers/authSlice'
import { initializeLanguage } from './reducers/languageSlice'
import { initializeTheme } from './reducers/themeSlice'
import { removeAllAlerts } from './reducers/alertSlice'
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

// Component to handle route changes and clear alerts
const RouteHandler = () => {
   const location = useLocation()

   useEffect(() => {
      // Clear all alerts when route changes
      store.dispatch(removeAllAlerts())
   }, [location.pathname])

   return null
}

// Inner component that has access to SessionContext
const AppContent = () => {
   useEffect(() => {
      // Initialize language and theme first
      store.dispatch(initializeLanguage())
      store.dispatch(initializeTheme())

      // Check for tokens in localStorage when app first runs
      if (localStorage.token) {
         // If there is a token set axios headers for all requests
         setAuthToken(localStorage.token, localStorage.refreshToken)
      }

      // Try to fetch a user, if no token or invalid token we
      // will get a 401 response from our API
      store.dispatch(loadUser())

      // Log user out from all tabs if they log out in one tab
      window.addEventListener('storage', () => {
         if (!localStorage.token) store.dispatch({ type: LOGOUT })
      })
   }, [])

   return (
      <Router>
         <RouteHandler />
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
   )
}

const App = () => {
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
               <AppContent />
            </ChakraProvider>
         </Provider>
      </GoogleOAuthProvider>
   )
}

// =============================================================================
// EXPORT
// =============================================================================

export default App
