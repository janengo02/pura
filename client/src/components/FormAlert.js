import {
   Alert,
   AlertIcon,
   AlertTitle,
   AlertDescription,
   SlideFade,
   CloseButton,
   Spinner,
   Spacer
} from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { removeAlert } from '../actions/alert'
import Link from './typography/Link'
import t from '../lang/i18n'

const FormAlert = ({ alerts, removeAlert, ...props }) => {
   return (
      alerts.length > 0 &&
      alerts.map((alert, index) =>
         alert.alertType === 'loading' ? (
            <SlideFade in={true} offsetY='-20px' key={alert.id}>
               <Alert
                  borderRadius='0.375rem;'
                  mb={index < alerts.length - 1 ? '6' : '0'}
                  bg='gray.50'
                  {...props}
               >
                  <Spinner size='sm' marginInlineEnd={3} />
                  <AlertTitle>{t(alert.title)}</AlertTitle>
                  <AlertDescription>{t(alert.msg)}</AlertDescription>
               </Alert>
            </SlideFade>
         ) : (
            <SlideFade in={true} offsetY='-20px' key={alert.id}>
               <Alert
                  status={alert.alertType}
                  borderRadius='0.375rem;'
                  mb={index < alerts.length - 1 ? '6' : '0'}
                  {...props}
               >
                  <AlertIcon />
                  <AlertTitle>{t(alert.title)}</AlertTitle>
                  <AlertDescription>{t(alert.msg)}</AlertDescription>
                  {alert.msg === 'alert-invalid-password' && (
                     <Link
                        to='/recover'
                        text={t('guide-recover_password')}
                        ml={1.5}
                     />
                  )}

                  <Spacer />
                  <CloseButton
                     onClick={async (e) => {
                        e.preventDefault()
                        removeAlert(alert.id)
                     }}
                  />
               </Alert>
            </SlideFade>
         )
      )
   )
}

FormAlert.propTypes = {
   alerts: PropTypes.array.isRequired,
   removeAlert: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
   alerts: state.alert
})

export default connect(mapStateToProps, { removeAlert })(FormAlert)
