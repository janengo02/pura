// =============================================================================
// EVENT ATTENDEES COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import {
   VStack,
   HStack,
   Text,
   Button,
   Badge,
   Collapse,
   useDisclosure
} from '@chakra-ui/react'
import { PiUsers, PiCaretDown, PiCaretUp } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import AttendeeAvatar from './AttendeeAvatar'
import { calculateResponseStats } from '../../../../utils/eventUtils'

const EventAttendees = ({ attendees }) => {
   const { t } = useReactiveTranslation()
   const { isOpen, onToggle } = useDisclosure()

   if (!attendees || attendees.length === 0) return null

   const responseStats = calculateResponseStats(attendees)

   return (
      <VStack align='start' spacing={2} w='full'>
         <HStack spacing={3} w='full'>
            <PiUsers size={16} />
            <Button
               variant='ghost'
               size='sm'
               onClick={onToggle}
               justifyContent='space-between'
               flexDirection='row'
               p={0}
               h='auto'
               w='full'
               rightIcon={
                  isOpen ? <PiCaretUp size={14} /> : <PiCaretDown size={14} />
               }
               _hover={{ bg: 'transparent' }}
               _active={{ bg: 'transparent' }}
               _focus={{ bg: 'transparent' }}
            >
               <VStack align='start' spacing={1} w='full'>
                  <Text fontSize='sm' fontWeight='medium' color='text.primary'>
                     {t('event-attendees')} ({attendees.length})
                  </Text>

                  {/* Response Summary */}
                  <HStack spacing={2} fontSize='xs'>
                     {responseStats.accepted > 0 && (
                        <Text color='text.secondary'>
                           {responseStats.accepted} {t('attendee-accepted')}
                        </Text>
                     )}
                     {responseStats.declined > 0 && (
                        <Text color='text.secondary'>
                           {responseStats.declined} {t('attendee-declined')}
                        </Text>
                     )}
                     {responseStats.tentative > 0 && (
                        <Text color='text.secondary'>
                           {responseStats.tentative} {t('attendee-tentative')}
                        </Text>
                     )}
                     {responseStats.awaiting > 0 && (
                        <Text color='text.secondary'>
                           {responseStats.awaiting} {t('attendee-pending')}
                        </Text>
                     )}
                  </HStack>
               </VStack>
            </Button>
         </HStack>

         {/* Collapsible Detailed Attendee List */}
         <Collapse in={isOpen} animateOpacity style={{ width: '100%' }}>
            <VStack align='start' spacing={3} pl={6} w='full'>
               {/* Detailed Attendee List */}
               <VStack align='start' spacing={2} w='full'>
                  {attendees.map((attendee, index) => (
                     <HStack
                        key={index}
                        justify='space-between'
                        w='full'
                        spacing={3}
                     >
                        <HStack spacing={3} flex={1} minW={0}>
                           <AttendeeAvatar attendee={attendee} />
                           <VStack align='start' spacing={0} flex={1} minW={0}>
                              <Text
                                 fontSize='sm'
                                 color='text.primary'
                                 wordBreak='break-word'
                                 flex={1}
                                 minW={0}
                              >
                                 {attendee.displayName || attendee.email}
                              </Text>

                              {attendee.isOrganizer && (
                                 <Text fontSize='sm' color='text.secondary'>
                                    {t('attendee-organizer')}
                                 </Text>
                              )}
                           </VStack>
                        </HStack>
                     </HStack>
                  ))}
               </VStack>
            </VStack>
         </Collapse>
      </VStack>
   )
}

EventAttendees.propTypes = {
   attendees: PropTypes.arrayOf(
      PropTypes.shape({
         email: PropTypes.string,
         displayName: PropTypes.string,
         responseStatus: PropTypes.oneOf([
            'accepted',
            'declined',
            'tentative',
            'needsAction'
         ]),
         isOptional: PropTypes.bool,
         isOrganizer: PropTypes.bool,
         isSelf: PropTypes.bool
      })
   )
}

export default EventAttendees
