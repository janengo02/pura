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
import { removeAlertAction } from '../../actions/alertActions'
import Link from '../typography/Link'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

const FormAlert = ({ alerts, removeAlertAction, ...props }) => {
   const { t } = useReactiveTranslation()
   return (
      alerts.length > 0 &&
      alerts.map((alert, index) =>
         alert.alertType === 'loading' ? (
            <SlideFade in={true} offsetY='-20px' key={alert.id}>
               <Alert
                  borderRadius='0.375rem;'
                  mb={index < alerts.length - 1 ? '6' : '0'}
                  bg='bg.surface'
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
                        removeAlertAction(alert.id)
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
   removeAlertAction: PropTypes.func.isRequired
}

const mapStateToProps = (state) => ({
   alerts: state.alert
})

export default connect(mapStateToProps, { removeAlertAction })(FormAlert)
