import React from 'react'
import { connect } from 'react-redux'
import { Link as ChakraLink } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { removeAllAlert } from '../../actions/alert'

const Link = ({ removeAllAlert, to, text, ...props }) => {
   return (
      <ChakraLink
         as={ReactRouterLink}
         color={props.color ? props.color : 'purple.500'}
         to={to}
         {...props}
         onClick={removeAllAlert}
      >
         {text}
      </ChakraLink>
   )
}
Link.propTypes = {
   removeAllAlert: PropTypes.func.isRequired
}
export default connect(null, { removeAllAlert })(Link)
