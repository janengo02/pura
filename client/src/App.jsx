import React from 'react'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import AppAlert from './components/AppAlert'
import Register from './features/register/Register'
import Login from './features/login/Login'
import Landing from './features/landing/Landing'

// Redux
import { Provider } from 'react-redux'
import store from './store'

import './App.css'
import { ChakraProvider } from '@chakra-ui/react'

const App = () => (
  <Provider store={store}>
    <ChakraProvider>
      <Router>
         <AppAlert />
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='register' element={<Register />} />
          <Route path='login' element={<Login />} />
          {/* <Route
               path="dashboard"
               element={<PrivateRoute component={Dashboard} />}
            />
            <Route path="/*" element={<NotFound />} /> */}
        </Routes>
      </Router>
    </ChakraProvider>
  </Provider>
)
export default App
