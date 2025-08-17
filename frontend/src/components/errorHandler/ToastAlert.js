// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// UI Components
import {
   Alert,
   AlertIcon,
   AlertTitle,
   AlertDescription,
   SlideFade,
   CloseButton,
   Spinner,
   Spacer,
   Box,
   VStack
} from '@chakra-ui/react'

// Internal Components

// Actions & Utils
import { removeAlertAction } from '../../actions/alertActions'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// =============================================================================
// CONSTANTS
// =============================================================================
const TOAST_STYLES = {
   borderRadius: '0.5rem',
   boxShadow: 'lg',
   maxW: '100%',
   w: 'full'
}

const TOAST_CONTAINER_STYLES = {
   position: 'fixed',
   top: '2rem',
   left: '50%',
   transform: 'translateX(-50%)',
   zIndex: 9999,
   pointerEvents: 'none',
   w: 'full',
   maxW: '500px'
}
// =============================================================================
// COMPONENT SECTIONS
// =============================================================================

/**
 * Individual ToastAlert Item Component
 */
const ToastItem = React.memo(({ alert, onRemove }) => {
   const { t } = useReactiveTranslation()

   const toastContent = useMemo(() => {
      if (alert.alertType === 'loading') {
         return (
            <Alert {...TOAST_STYLES}>
               <Spinner size='md' marginInlineEnd={3} />
               <VStack>
                  <AlertTitle>{t(alert.title)}</AlertTitle>
                  <AlertDescription>{t(alert.msg)}</AlertDescription>
               </VStack>
            </Alert>
         )
      }

      return (
         <Alert
            status={alert.alertType}
            variant='solid'
            {...TOAST_STYLES}
            alignItems='flex-start'
         >
            <AlertIcon />
            <VStack align='flex-start'>
               <AlertTitle>{t(alert.title)}</AlertTitle>
               <AlertDescription>{t(alert.msg)}</AlertDescription>
            </VStack>

            <Spacer />
            <CloseButton
               onClick={(e) => {
                  e.preventDefault()
                  onRemove(alert.id)
               }}
               style={{ pointerEvents: 'auto' }}
            />
         </Alert>
      )
   }, [alert, t, onRemove])

   return (
      <SlideFade in={true} offsetY='-20px'>
         <Box pointerEvents='auto' mb={3}>
            {toastContent}
         </Box>
      </SlideFade>
   )
})

ToastItem.displayName = 'ToastItem'

ToastItem.propTypes = {
   alert: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      msg: PropTypes.string.isRequired,
      alertType: PropTypes.string.isRequired
   }).isRequired,
   onRemove: PropTypes.func.isRequired
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const ToastAlert = React.memo(({ alerts, removeAlertAction }) => {
   // -------------------------------------------------------------------------
   // MEMOIZED VALUES
   // -------------------------------------------------------------------------

   const toastItems = useMemo(
      () =>
         alerts.map((alert) => (
            <ToastItem
               key={alert.id}
               alert={alert}
               onRemove={removeAlertAction}
            />
         )),
      [alerts, removeAlertAction]
   )

   // -------------------------------------------------------------------------
   // RENDER LOGIC
   // -------------------------------------------------------------------------

   if (alerts.length === 0) return null

   return (
      <Box {...TOAST_CONTAINER_STYLES}>
         <VStack spacing={0} align='stretch'>
            {toastItems}
         </VStack>
      </Box>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

ToastAlert.displayName = 'ToastAlert'

ToastAlert.propTypes = {
   alerts: PropTypes.array.isRequired,
   removeAlertAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   alerts: state.alert
})

const mapDispatchToProps = {
   removeAlertAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(ToastAlert)
