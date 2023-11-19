import {
   Avatar,
   Container,
   Flex,
   Heading,
   IconButton,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Spacer
} from '@chakra-ui/react'
import { AddIcon, HamburgerIcon, CalendarIcon } from '@chakra-ui/icons'
import React from 'react'

const Dashboard = () => {
   return (
      <>
         <Container
            h={20}
            bg='gray.50'
            w='100%'
            maxW='100vw'
            p={10}
            borderBottomColor='gray.200'
            borderBottomWidth={1}
         >
            <Flex h='full' w='full' alignItems='center'>
               <Flex gap={5}>
                  <Menu>
                     <MenuButton
                        as={IconButton}
                        aria-label='Options'
                        icon={<HamburgerIcon />}
                        variant='ghost'
                     ></MenuButton>
                     <MenuList>
                        <MenuItem icon={<AddIcon />}>New Page</MenuItem>
                     </MenuList>
                  </Menu>
                  <Heading as='h3' size='lg'>
                     PURA TASK
                  </Heading>
               </Flex>
               <Spacer />
               <Flex gap={8}>
                  <IconButton
                     isRound={true}
                     variant='outline'
                     colorScheme='gray'
                     bg='white'
                     icon={<CalendarIcon />}
                  ></IconButton>
                  <Avatar
                     name='Kent Dodds'
                     w={10}
                     h={10}
                     src='https://bit.ly/kent-c-dodds'
                  />
               </Flex>
            </Flex>
         </Container>

         <Container bg='blue.50' w='full' maxW='100vw' h='100vh'>
            hello
         </Container>
      </>
   )
}

export default Dashboard
