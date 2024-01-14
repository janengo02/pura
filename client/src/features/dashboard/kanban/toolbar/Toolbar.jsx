import React from 'react'
import { Flex, Spacer, Button, Divider } from '@chakra-ui/react'
import { PiPlusCircleFill } from 'react-icons/pi'
import t from '../../../../lang/i18n'

import Sort from './Sort'
import Settings from './Settings'
import Filter from './Filter'
const Toolbar = () => {
   return (
      <Flex w='full' maxW={802} paddingY={5} paddingX={3} alignItems='center'>
         <Flex gap={2} alignItems='center'>
            <Sort />
            <Divider orientation='vertical' h={8} />
            <Filter />
         </Flex>

         <Spacer />
         <Flex gap={5} alignItems='center'>
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
