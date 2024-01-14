import React, { useState } from 'react'
import { Card, Flex, IconButton, Spacer, Text } from '@chakra-ui/react'
import { PiDotsThreeBold, PiPlusBold } from 'react-icons/pi'

const ProgressHeader = ({ progress }) => {
   const [hovered, setHovered] = useState(false)
   return (
      <Card
         variant='filled'
         bg={progress.color}
         paddingLeft={3}
         paddingRight={1}
         paddingY={1}
         w={250}
         onMouseEnter={(e) => {
            e.preventDefault()
            setHovered(true)
         }}
         onMouseLeave={(e) => {
            e.preventDefault()
            setHovered(false)
         }}
      >
         <Flex w='full' alignItems='center'>
            <Text color={progress.title_color} fontWeight={500}>
               {progress.title}
            </Text>
            <Spacer />
            <Flex alignItems='center'>
               <IconButton
                  aria-label='Options'
                  icon={<PiDotsThreeBold />}
                  variant='ghost'
                  colorScheme='blackAlpha'
                  size='xs'
                  opacity={hovered ? 1 : 0}
               />
               <IconButton
                  aria-label='Options'
                  icon={<PiPlusBold />}
                  variant='ghost'
                  colorScheme='blackAlpha'
                  size='xs'
                  opacity={hovered ? 1 : 0}
               />
            </Flex>
         </Flex>
      </Card>
   )
}

export default ProgressHeader
