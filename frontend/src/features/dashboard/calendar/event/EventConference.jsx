// =============================================================================
// EVENT CONFERENCE COMPONENT
// =============================================================================

import React, { useState, useCallback } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
   VStack,
   HStack,
   Text,
   Button,
   IconButton,
   Tooltip,
   Input,
   Spinner
} from '@chakra-ui/react'
import { PiVideoCamera, PiCopy, PiPlus, PiTrash, PiX } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import { createGoogleMeetSpaceAction } from '../../../../actions/googleAccountActions'
import useLoading from '../../../../hooks/useLoading'

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
                  <Button colorScheme='blue' onClick={handleJoinMeeting}>
                     {t('event-join-meeting')}
                  </Button>

                  <Tooltip label={t('copy-meeting-url')} placement='top'>
                     <IconButton
                        variant='ghost'
                        onClick={handleCopyUrl}
                        icon={<PiCopy size={16} />}
                     />
                  </Tooltip>
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

// =============================================================================
// EVENT CONFERENCE INPUT COMPONENT
// =============================================================================

const EventConferenceInput = ({
   conferenceData,
   setConferenceData,
   accountEmail,
   createGoogleMeetSpaceAction
}) => {
   const { t } = useReactiveTranslation()
   const [createGoogleMeet, createGoogleMeetLoading] = useLoading(
      useCallback(async () => {
         if (!accountEmail) {
            console.error('No account email provided for Meet creation')
            return
         }

         const result = await createGoogleMeetSpaceAction({
            accountEmail: accountEmail,
            config: {
               accessType: 'TRUSTED',
               entryPointAccess: 'ALL'
            }
         })

         if (result?.meetUri) {
            const newConferenceData = {
               type: 'google_meet',
               id: result.meetingCode,
               joinUrl: result.meetUri,
               spaceId: result.spaceId,
               phoneNumbers: []
            }

            setConferenceData?.(newConferenceData)
         }
      }, [accountEmail, createGoogleMeetSpaceAction, setConferenceData])
   )

   const handleRemoveConference = useCallback(() => {
      setConferenceData?.(null)
   }, [setConferenceData])

   return (
      <>
         {conferenceData?.joinUrl ? (
            <HStack align='start' spacing={0}>
               <EventConference conferenceData={conferenceData} />
               <Tooltip label={t('remove-conference')} placement='top'>
                  <IconButton
                     variant='ghost'
                     icon={<PiX size={16} />}
                     onClick={handleRemoveConference}
                  />
               </Tooltip>
            </HStack>
         ) : (
            <HStack spacing={3} w='full'>
               <PiVideoCamera size={16} />
               <Button
                  size='md'
                  leftIcon={
                     createGoogleMeetLoading ? <Spinner size='xs' /> : null
                  }
                  variant='ghost'
                  onClick={createGoogleMeet}
                  isDisabled={!accountEmail || createGoogleMeetLoading}
               >
                  {createGoogleMeetLoading
                     ? t('creating-meet')
                     : t('create-google-meet')}
               </Button>
            </HStack>
         )}
      </>
   )
}

EventConferenceInput.propTypes = {
   conferenceData: PropTypes.shape({
      type: PropTypes.string,
      id: PropTypes.string,
      joinUrl: PropTypes.string,
      phoneNumbers: PropTypes.array
   }),
   setConferenceData: PropTypes.func.isRequired,
   accountEmail: PropTypes.string,
   createGoogleMeetSpaceAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX CONNECTION FOR EventConferenceInput
// =============================================================================

const mapDispatchToProps = {
   createGoogleMeetSpaceAction
}

const ConnectedEventConferenceInput = connect(
   null,
   mapDispatchToProps
)(EventConferenceInput)

export default EventConference
export { ConnectedEventConferenceInput as EventConferenceInput }
