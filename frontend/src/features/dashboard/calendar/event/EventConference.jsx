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
import { createGoogleMeetSpaceAction } from '../../../../actions/calendarActions'
import useLoading from '../../../../hooks/useLoading'

const EventConference = ({ conferenceData }) => {
   const { t } = useReactiveTranslation()

   if (!conferenceData) return null

   const handleCopyUrl = async () => {
      if (conferenceData.joinUrl) {
         try {
            await navigator.clipboard.writeText(conferenceData.joinUrl)
            // @todo: Display a toast notification
         } catch (err) {
            // @todo: Display a toast notification
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
                  <PiVideoCamera size={18} />
                  <Button colorScheme='blue' onClick={handleJoinMeeting}>
                     {t('btn-event-join-meeting')}
                  </Button>

                  <Tooltip
                     label={t('tooltip-copy-meeting-url')}
                     placement='top'
                  >
                     <IconButton
                        variant='ghost'
                        onClick={handleCopyUrl}
                        icon={<PiCopy size={18} />}
                     />
                  </Tooltip>
               </HStack>
               <Text fontSize='sm' color='text.secondary' ml={8}>
                  {t('label-meet-id')}: {conferenceData.id}
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
               <Tooltip label={t('btn-remove-conference')} placement='top'>
                  <IconButton
                     variant='ghost'
                     icon={<PiX size={18} />}
                     onClick={handleRemoveConference}
                  />
               </Tooltip>
            </HStack>
         ) : (
            <HStack spacing={3} w='full'>
               <PiVideoCamera size={18} />
               <Button
                  size='md'
                  leftIcon={
                     createGoogleMeetLoading ? <Spinner size='md' /> : null
                  }
                  variant='ghost'
                  onClick={createGoogleMeet}
                  isDisabled={!accountEmail || createGoogleMeetLoading}
               >
                  {createGoogleMeetLoading
                     ? t('alert-creating-meet')
                     : t('btn-create-google-meet')}
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
