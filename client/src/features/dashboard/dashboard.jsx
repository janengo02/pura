import React from 'react'
import { Container } from '@chakra-ui/react'
import Navbar from './Navbar'
// import t from '../../lang/i18n'

const Dashboard = () => {
   return (
      <>
         <Navbar />
         <Container bg='white' w='full' maxW='100vw' h='100vh'>
            hello
         </Container>
      </>
   )
}

export default Dashboard
