// =============================================================================
// IMPORTS
// =============================================================================

// React
import React from 'react'

// UI Components
import { Flex, Spacer, Button } from '@chakra-ui/react'

// Icons & Utils
import { PiPlusCircleFill } from 'react-icons/pi'
import t from '../../../../lang/i18n'

// Internal Components
import Settings from './Settings'
import ReloadButton from './ReloadButton'

// =============================================================================
// CONSTANTS
// =============================================================================

const TOOLBAR_STYLES = {
   width: 'full',
   maxWidth: 802,
   paddingY: 5,
   paddingX: 3,
   alignItems: 'center'
}

const BUTTON_STYLES = {
   size: 'sm',
   colorScheme: 'purple'
}

const ACTIONS_CONTAINER_STYLES = {
   gap: 5,
   alignItems: 'center'
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Toolbar = React.memo(() => {
   // -------------------------------------------------------------------------
   // EVENT HANDLERS
   // -------------------------------------------------------------------------

   const handleNewEvent = () => {
      // TODO: Implement new event creation
      console.log('Create new event')
   }

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------

   return (
      <Flex {...TOOLBAR_STYLES}>
         <Flex gap={2} alignItems='center'>
            {/* Left side actions - currently empty */}
         </Flex>

         <Spacer />

         <Flex {...ACTIONS_CONTAINER_STYLES}>
            <ReloadButton />
            <Settings />
            <Button
               {...BUTTON_STYLES}
               leftIcon={<PiPlusCircleFill />}
               onClick={handleNewEvent}
            >
               {t('btn-new')}
            </Button>
         </Flex>
      </Flex>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Toolbar.displayName = 'CalendarToolbar'

// =============================================================================
// EXPORT
// =============================================================================

export default Toolbar
