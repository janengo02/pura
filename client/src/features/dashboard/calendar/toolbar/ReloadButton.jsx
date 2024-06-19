import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { IconButton } from '@chakra-ui/react'
import { PiArrowClockwise } from 'react-icons/pi'
import { listGoogleEvents } from '../../../../actions/googleAccount'

const ReloadButton = ({
   // Redux props
   listGoogleEvents
}) => {
   return (
      <IconButton
         aria-label='Options'
         icon={<PiArrowClockwise size={22} />}
         variant='ghost'
         size='sm'
         colorScheme='gray'
         onClick={async (e) => {
            e.preventDefault()
            listGoogleEvents()
         }}
      />
   )
}

ReloadButton.propTypes = {
   listGoogleEvents: PropTypes.func.isRequired
}
export default connect(null, {
   listGoogleEvents
})(ReloadButton)
