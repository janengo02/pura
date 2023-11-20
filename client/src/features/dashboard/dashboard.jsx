import React from 'react'
import {
   Container,
   Flex,
   Heading,
   IconButton,
   Menu,
   MenuButton,
   MenuItem,
   MenuList,
   Spacer,
   useDisclosure,
   Drawer
} from '@chakra-ui/react'
import { PiCalendar, PiDotsNine, PiFilePlus } from 'react-icons/pi'
import ProfileMenu from './ProfileMenu'
import Sidebar from './Sidebar'
import t from '../../lang/i18n'

const Dashboard = () => {
   const sidebar = useDisclosure()
   const dropdownMenu = useDisclosure()
   return (
      <>
         <Drawer
            isOpen={sidebar.isOpen}
            placement='left'
            onClose={sidebar.onClose}
         >
            <Sidebar />
         </Drawer>
         <Container
            position='sticky'
            top={0}
            left={0}
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
                  <Menu
                     isOpen={dropdownMenu.isOpen}
                     onClose={dropdownMenu.onClose}
                  >
                     <MenuButton
                        as={IconButton}
                        onClick={() => {
                           dropdownMenu.onClose()
                           sidebar.onOpen()
                        }}
                        onMouseEnter={dropdownMenu.onOpen}
                        aria-label='Options'
                        icon={<PiDotsNine size={28} />}
                        variant='ghost'
                        colorScheme='gray'
                     ></MenuButton>
                     <MenuList
                        onMouseEnter={dropdownMenu.onOpen}
                        onMouseLeave={dropdownMenu.onClose}
                     >
                        <MenuItem icon={<PiFilePlus size={20} />}>
                           {t('btn-new_page')}
                        </MenuItem>
                     </MenuList>
                  </Menu>
                  <Heading as='h3' size='lg' color='gray.600'>
                     data.page.title
                  </Heading>
               </Flex>
               <Spacer />
               <Flex gap={8}>
                  <IconButton
                     isRound={true}
                     variant='solid'
                     colorScheme='purple'
                     icon={<PiCalendar size={22} />}
                  />
                  <ProfileMenu />
               </Flex>
            </Flex>
         </Container>

         <Container bg='white' w='full' maxW='100vw' h='100vh'>
            hello
         </Container>
      </>
   )
}

export default Dashboard
