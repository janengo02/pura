import React from 'react'
import { connect } from 'react-redux'
import { Link as ChakraLink } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { removeAllAlerts } from '../../reducers/alertSlice'

const Link = ({ removeAllAlerts, to, text, ...props }) => {
   return (
      <ChakraLink
         as={ReactRouterLink}
         color={props.color ? props.color : 'accent.primary'}
         to={to}
         {...props}
         onClick={removeAllAlerts}
      >
         {text}
      </ChakraLink>
   )
}
Link.propTypes = {
   removeAllAlerts: PropTypes.func.isRequired
}
export default connect(null, { removeAllAlerts })(Link)
