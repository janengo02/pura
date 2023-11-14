// import { useState } from "react"

import {
   Container,
   Flex,
   GridItem,
   Heading,
   SimpleGrid,
   Text,
   VStack,
   Button
} from "@chakra-ui/react"
import { MultiInput } from "../../components/MultiInput"
import { FormProvider, useForm } from "react-hook-form"
import { registerSchema as s } from "./RegisterSchema"
import { yupResolver } from "@hookform/resolvers/yup"

const Register = () => {
   const methods = useForm({
      resolver: yupResolver(s)
   })
   // const [success, setSuccess] = useState(false)

   const onSubmit = methods.handleSubmit((data) => {
      console.log(data)
      methods.reset()
      //  setSuccess(true)
   })

   return (
      <Container maxW="container.xl" p={0}>
         <Flex h="100vh" py={20}>
            <VStack
               w="full"
               h="full"
               p={10}
               spacing={10}
               alignItems="flex-start"
            >
               <VStack spacing={5} alignItems="flex-start">
                  <Heading size="2xl">Register</Heading>
                  <Text>
                     Manage all your tasks using Kanban board and Time-boxed
                     method
                  </Text>
               </VStack>
               <FormProvider {...methods}>
                  <form
                     onSubmit={(e) => e.preventDefault()}
                     noValidate
                     autoComplete="off"
                     className="container"
                     style={{ width: "100%" }}
                  >
                     <SimpleGrid columns={1} rowGap={6} w="full">
                        <GridItem colSpan={1}>
                           <MultiInput
                              name="name"
                              required
                              label="Name"
                              type="text"
                              placeholder="John Doe"
                              size="lg"
                              validation={s.name}
                           />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <MultiInput
                              name="email"
                              required
                              label="Email"
                              type="text"
                              placeholder="john.doe@abc.com"
                              size="lg"
                              validation={s.email}
                           />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <MultiInput
                              name="password"
                              required
                              label="Password"
                              type="password"
                              helpertext="6-20 characters"
                              size="lg"
                              validation={s.password}
                           />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <MultiInput
                              name="cpassword"
                              required
                              label="Confirm Password"
                              type="password"
                              helpertext="6-20 characters"
                              size="lg"
                              validation={s.cpassword}
                           />
                        </GridItem>
                        <GridItem colSpan={1}>
                           <Button size="lg" w="full" onClick={onSubmit}>
                              Register
                           </Button>
                        </GridItem>
                     </SimpleGrid>
                  </form>
               </FormProvider>
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
}

export default Register
