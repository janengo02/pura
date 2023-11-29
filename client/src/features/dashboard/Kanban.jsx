import React from 'react'

import { Flex } from '@chakra-ui/react'

// import t from '../../lang/i18n'

import Toolbar from './toolbar/Toolbar'

const Kanban = () => {
   return (
      <Flex
         flexDirection='column'
         w='fit-content'
         h='fit-content'
         minH='full'
         minW='full'
         alignItems='center'
      >
         <Toolbar />
      </Flex>
   )
}

export default Kanban
