import React from "react"

import {
   Container,
   Flex,
   FormControl,
   FormLabel,
   GridItem,
   Heading,
   SimpleGrid,
   Text,
   VStack,
   Input,
   Button
} from "@chakra-ui/react"

const Register = () => (
   <Container maxW="container.xl" p={0}>
      <Flex h="100vh" py={20}>
         <VStack w="full" h="full" p={10} spacing={10} alignItems="flex-start">
            <VStack spacing={5} alignItems="flex-start">
               <Heading size="2xl">Register</Heading>
               <Text>
                  Manage all your tasks using Kanban board and Time-boxed method
               </Text>
            </VStack>
            <SimpleGrid columns={1} rowGap={6} w="full">
               <GridItem colSpan={1}>
                  <FormControl>
                     <FormLabel>User Name</FormLabel>
                     <Input placeholder="John Doe" />
                  </FormControl>
               </GridItem>
               <GridItem colSpan={1}>
                  <FormControl>
                     <FormLabel>Email</FormLabel>
                     <Input placeholder="johndoe@gabc.com" />
                  </FormControl>
               </GridItem>
               <GridItem colSpan={1}>
                  <Button size="lg" w="full">
                     Register
                  </Button>
               </GridItem>
            </SimpleGrid>
         </VStack>
         <VStack
            w="full"
            h="full"
            p={10}
            spacing={10}
            alignItems="flex-start"
            bg="gray.50"
         ></VStack>
      </Flex>
   </Container>
)

export default Register
