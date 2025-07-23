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
import {
   calculateResponseStats,
   getResponseText
} from '../../../../utils/eventUtils'

const EventAttendees = ({ attendees }) => {
   const { t } = useReactiveTranslation()
   const { isOpen, onToggle } = useDisclosure()

   if (!attendees || attendees.length === 0) return null

   const responseStats = calculateResponseStats(attendees)

   return (
      <VStack align='start' spacing={2} mb={3} w='full'>
         {/* Dropdown Header */}
         <Button
            variant='ghost'
            size='sm'
            onClick={onToggle}
            justifyContent='flex-start'
            p={2}
            h='auto'
            w='full'
            leftIcon={<PiUsers size={16} />}
            rightIcon={
               isOpen ? <PiCaretUp size={14} /> : <PiCaretDown size={14} />
            }
         >
            <VStack align='start' spacing={1}>
               <Text fontSize='sm' fontWeight='medium' color='text.primary'>
                  {t('event-attendees')} ({attendees.length})
               </Text>

               {/* Response Summary */}
               <HStack spacing={3} fontSize='xs'>
                  {responseStats.accepted > 0 && (
                     <HStack spacing={1}>
                        <Badge size='xs' colorScheme='green'>
                           {responseStats.accepted}
                        </Badge>
                        <Text color='text.secondary'>
                           {t('attendee-accepted')}
                        </Text>
                     </HStack>
                  )}
                  {responseStats.declined > 0 && (
                     <HStack spacing={1}>
                        <Badge size='xs' colorScheme='red'>
                           {responseStats.declined}
                        </Badge>
                        <Text color='text.secondary'>
                           {t('attendee-declined')}
                        </Text>
                     </HStack>
                  )}
                  {responseStats.tentative > 0 && (
                     <HStack spacing={1}>
                        <Badge size='xs' colorScheme='yellow'>
                           {responseStats.tentative}
                        </Badge>
                        <Text color='text.secondary'>
                           {t('attendee-tentative')}
                        </Text>
                     </HStack>
                  )}
                  {responseStats.awaiting > 0 && (
                     <HStack spacing={1}>
                        <Badge size='xs' colorScheme='gray'>
                           {responseStats.awaiting}
                        </Badge>
                        <Text color='text.secondary'>
                           {t('attendee-pending')}
                        </Text>
                     </HStack>
                  )}
               </HStack>
            </VStack>
         </Button>

         {/* Collapsible Detailed Attendee List */}
         <Collapse in={isOpen} animateOpacity style={{ width: '100%' }}>
            <VStack align='start' spacing={3} pl={4} w='full'>
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
                                 <Badge
                                    size='sm'
                                    colorScheme='purple'
                                    flexShrink={0}
                                 >
                                    {t('attendee-organizer')}
                                 </Badge>
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
