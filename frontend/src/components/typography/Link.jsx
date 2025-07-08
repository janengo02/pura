import React from 'react'
import { connect } from 'react-redux'
import { Link as ChakraLink } from '@chakra-ui/react'
import { Link as ReactRouterLink } from 'react-router-dom'
import PropTypes from 'prop-types'
import { removeAllAlertAction } from '../../actions/alertActions'

const Link = ({ removeAllAlertAction, to, text, ...props }) => {
   return (
      <ChakraLink
         as={ReactRouterLink}
         color={props.color ? props.color : 'accent.primary'}
         to={to}
         {...props}
         onClick={removeAllAlertAction}
      >
         {text}
      </ChakraLink>
   )
}
Link.propTypes = {
   removeAllAlertAction: PropTypes.func.isRequired
}
export default connect(null, { removeAllAlertAction })(Link)
