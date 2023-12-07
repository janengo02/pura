import React from 'react'
import { Card, Text } from '@chakra-ui/react'

const ProgressHeader = ({ progress }) => {
   return (
      <Card variant='filled' bg={progress.color} p={3} minW={280}>
         <Text color={progress.title_color} fontWeight={500}>
            {progress.title}
         </Text>
      </Card>
   )
}

export default ProgressHeader
