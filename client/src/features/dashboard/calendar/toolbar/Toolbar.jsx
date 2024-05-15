import React from 'react'
import { Flex, Spacer, Button } from '@chakra-ui/react'
import { PiPlusCircleFill } from 'react-icons/pi'
import t from '../../../../lang/i18n'

import Settings from './Settings'
import ReloadButton from './ReloadButton'
const Toolbar = () => {
   return (
      <Flex w='full' maxW={802} paddingY={5} paddingX={3} alignItems='center'>
         <Flex gap={2} alignItems='center'></Flex>

         <Spacer />
         <Flex gap={5} alignItems='center'>
            <ReloadButton />
            <Settings />
            <Button
               size='sm'
               colorScheme='purple'
               leftIcon={<PiPlusCircleFill />}
            >
               {t('btn-new')}
            </Button>
         </Flex>
      </Flex>
   )
}

export default Toolbar
