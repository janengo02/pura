import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import { IconButton } from '@chakra-ui/react'
import { PiArrowClockwise } from 'react-icons/pi'
import { loadCalendarAction } from '../../../../actions/googleAccountActions'

const ReloadButton = ({
   // Redux props
   loadCalendarAction,
   tasks
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
            // loadCalendarAction() //TODO: Add ranges
         }}
      />
   )
}

ReloadButton.propTypes = {
   loadCalendarAction: PropTypes.func.isRequired,
   tasks: PropTypes.array.isRequired
}
const mapStateToProps = (state) => ({
   tasks: state.page.tasks
})
export default connect(mapStateToProps, {
   loadCalendarAction
})(ReloadButton)
