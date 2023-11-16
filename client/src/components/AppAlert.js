import { Alert, AlertIcon, AlertTitle, AlertDescription } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

// TODO: Add Remove alert reducer
// TODO: Restyling alert
const AppAlert = ({ newAlert }) => {
   console.log(newAlert)
   return (
      newAlert.length>0 &&
      (
         <Alert position="fixed" status={newAlert[0].alertType} key={newAlert[0].id}>
            <AlertIcon />
            <AlertTitle>{newAlert[0].title}</AlertTitle>
            <AlertDescription>{newAlert[0].msg}</AlertDescription>
         </Alert>
      )
   )
}

AppAlert.propTypes = {
   newAlert: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
   newAlert: state.alert
})

export default connect(mapStateToProps)(AppAlert)
