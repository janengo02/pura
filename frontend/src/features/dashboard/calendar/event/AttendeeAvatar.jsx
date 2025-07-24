// =============================================================================
// ATTENDEE AVATAR COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { Avatar, AvatarBadge } from '@chakra-ui/react'
import { PiCheckBold, PiXBold } from 'react-icons/pi'
import {
   getRandomColor,
   getAttendeeInitials,
   getResponseBadgeColor
} from '../../../../utils/eventUtils'

const AttendeeAvatar = ({ attendee }) => {
   const name = attendee.displayName || attendee.email || 'Unknown'
   const colorKey = name.toLowerCase()
   const shouldShowBadge =
      attendee.responseStatus === 'accepted' ||
      attendee.responseStatus === 'declined'

   const getResponseStatusIcon = (responseStatus) => {
      switch (responseStatus) {
         case 'accepted':
            return <PiCheckBold color='white' fontWeight='bold' />
         case 'declined':
            return <PiXBold color='white' fontWeight='bold' />
         default:
            return <></>
      }
   }

   return (
      <Avatar
         name={name}
         size='sm'
         bg={attendee.isOrganizer ? 'purple.400' : getRandomColor(colorKey)}
         color='white'
      >
         {getAttendeeInitials(attendee)}
         {shouldShowBadge && (
            <AvatarBadge
               boxSize='1.25em'
               bg={getResponseBadgeColor(attendee.responseStatus)}
               border='1px solid'
               borderColor='bg.surface'
               p='3px'
               borderRadius='full'
               display='flex'
               alignItems='center'
               justifyContent='center'
            >
               {getResponseStatusIcon(attendee.responseStatus)}
            </AvatarBadge>
         )}
      </Avatar>
   )
}

AttendeeAvatar.propTypes = {
   attendee: PropTypes.shape({
      email: PropTypes.string,
      displayName: PropTypes.string,
      responseStatus: PropTypes.oneOf([
         'accepted',
         'declined',
         'tentative',
         'needsAction'
      ]),
      isOrganizer: PropTypes.bool
   }).isRequired
}

export default AttendeeAvatar
