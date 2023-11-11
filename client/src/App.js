import React from "react"
import { BrowserRouter as Router, Route, Routes } from "react-router-dom"
import Register from "./features/register/Register.js"
import Login from "./features/login/Login.js"

import "./App.css"
import { ChakraProvider } from "@chakra-ui/react"

const App = () => (
   <ChakraProvider>
      <Router>
         <Routes>
            {/* <Route path="/" element={<Landing />} /> */}
            <Route path="register" element={<Register />} />
            <Route path="login" element={<Login />} />
            {/* <Route
            path="dashboard"
            element={<PrivateRoute component={Dashboard} />}
          />
          <Route path="/*" element={<NotFound />} /> */}
         </Routes>
      </Router>
   </ChakraProvider>
)
export default App
