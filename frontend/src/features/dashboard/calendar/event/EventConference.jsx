// =============================================================================
// EVENT CONFERENCE COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import {
   VStack,
   HStack,
   Text,
   Button,
   IconButton,
   Tooltip
} from '@chakra-ui/react'
import { PiVideoCamera, PiCopy } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventConference = ({ conferenceData }) => {
   const { t } = useReactiveTranslation()

   if (!conferenceData) return null

   const handleCopyUrl = async () => {
      if (conferenceData.joinUrl) {
         try {
            await navigator.clipboard.writeText(conferenceData.joinUrl)
         } catch (err) {
            console.error('Failed to copy URL:', err)
         }
      }
   }

   const handleJoinMeeting = () => {
      if (conferenceData.joinUrl) {
         window.open(conferenceData.joinUrl, '_blank')
      }
   }

   return (
      <>
         {conferenceData.joinUrl && (
            <VStack align='start' spacing={2} w='full'>
               <HStack spacing={3} w='full'>
                  <PiVideoCamera size={16} />
                  <HStack justifyContent='space-between' w='full'>
                     <Button
                        size='sm'
                        colorScheme='blue'
                        borderRadius='full'
                        onClick={handleJoinMeeting}
                     >
                        {t('event-join-meeting')}
                     </Button>

                     <Tooltip label={t('copy-meeting-url')} placement='top'>
                        <IconButton
                           size='sm'
                           variant='ghost'
                           onClick={handleCopyUrl}
                           icon={<PiCopy size={14} />}
                        />
                     </Tooltip>
                  </HStack>
               </HStack>
               <Text fontSize='xs' color='text.secondary' ml={7}>
                  {t('meet-id')}: {conferenceData.id}
               </Text>
            </VStack>
         )}
      </>
   )
}

EventConference.propTypes = {
   conferenceData: PropTypes.shape({
      type: PropTypes.string,
      id: PropTypes.string,
      joinUrl: PropTypes.string,
      phoneNumbers: PropTypes.array
   })
}

export default EventConference
