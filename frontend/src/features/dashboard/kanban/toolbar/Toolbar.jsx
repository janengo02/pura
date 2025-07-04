// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React from 'react'

// UI Components
import { Flex, Spacer, Button, Divider } from '@chakra-ui/react'

// Icons
import { PiPlusCircleFill } from 'react-icons/pi'

// Internal Components
import Sort from './Sort'
import Settings from './Settings'
import Filter from './Filter'

// Utils
import t from '../../../../lang/i18n'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Toolbar = () => {
   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <Flex w='full' maxW={802} paddingY={5} paddingX={3} alignItems='center'>
         {/* Left Section - Controls */}
         <Flex gap={2} alignItems='center'>
            <Filter />
         </Flex>

         <Spacer />

         {/* Right Section - Actions */}
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

// =============================================================================
// EXPORT
// =============================================================================

export default Toolbar
