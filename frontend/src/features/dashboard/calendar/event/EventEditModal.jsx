// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useState, useCallback, useMemo, useEffect } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'

// UI Components
import {
   Card,
   CardHeader,
   CardBody,
   IconButton,
   Button,
   FormControl,
   FormLabel,
   Input,
   VStack,
   HStack,
   Text,
   Box,
   ScaleFade
} from '@chakra-ui/react'

// Actions
import { updateGoogleEventAction } from '../../../../actions/googleAccountActions'
import { updateTaskScheduleAction } from '../../../../actions/taskActions'
import { clearEventEditModalAction } from '../../../../actions/eventActions'

// Utils
import { stringToDateTimeLocal } from '../../../../utils/dates'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'
import { createSelector } from 'reselect'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const EventEditModal = React.memo(
   ({
      rightWidth = '100%',
      // Redux props
      event,
      updateGoogleEventAction,
      updateTaskScheduleAction,
      clearEventEditModalAction
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------

      const { t } = useReactiveTranslation()

      // -------------------------------------------------------------------------
      // STATE
      // -------------------------------------------------------------------------

      const [startTime, setStartTime] = useState(() =>
         stringToDateTimeLocal(event.start)
      )
      const [endTime, setEndTime] = useState(() =>
         stringToDateTimeLocal(event.end)
      )

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------
      const isModalOpen = useMemo(() => Boolean(event.id), [event.id])

      const isTimeValid = useMemo(() => {
         if (!startTime || !endTime) return false
         const start = new Date(startTime)
         const end = new Date(endTime)
         return start < end && !isNaN(start.getTime()) && !isNaN(end.getTime())
      }, [startTime, endTime])

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleStartTimeChange = useCallback((e) => {
         setStartTime(e.target.value)
      }, [])

      const handleEndTimeChange = useCallback((e) => {
         setEndTime(e.target.value)
      }, [])

      const handleCloseModal = useCallback(() => {
         // Clear the task from Redux state to close modal
         clearEventEditModalAction()
      }, [clearEventEditModalAction])

      const handleSave = useCallback(async () => {
         if (!isTimeValid) return

         try {
            const newStartTime = new Date(startTime)
            const newEndTime = new Date(endTime)

            // Set seconds and milliseconds to 0 for consistency
            newStartTime.setSeconds(0, 0)
            newEndTime.setSeconds(0, 0)

            const updates = {
               start: newStartTime.toISOString(),
               end: newEndTime.toISOString()
            }

            // Update based on event type
            if (event.eventType === 'task' || event.eventType === 'synced') {
               // Update only the task schedule slot
               await updateTaskScheduleAction({
                  page_id: event.pageId,
                  task_id: event.pura_task_id,
                  slot_index: event.pura_schedule_index,
                  ...updates
               })
            } else if (event.eventType === 'google') {
               // Update only the Google event
               await updateGoogleEventAction({
                  eventId: event.id,
                  calendarId: event.calendarId,
                  accountEmail: event.accountEmail,
                  ...updates
               })
            }

            handleCloseModal()
         } catch (error) {
            console.error('Error updating event:', error)
         }
      }, [
         isTimeValid,
         startTime,
         endTime,
         event,
         updateTaskScheduleAction,
         updateGoogleEventAction,
         handleCloseModal
      ])

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Initialize task data when task changes
      useEffect(() => {
         if (event) {
            setStartTime(stringToDateTimeLocal(event.start))
            setEndTime(stringToDateTimeLocal(event.end))
         }
      }, [event])

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      const renderModalOverlay = () => (
         <Box
            position='fixed'
            w={rightWidth}
            h='95%'
            top={20}
            right={0}
            bg='text.primary'
            opacity={0.3}
            onClick={handleCloseModal}
         />
      )
      const renderModalHeader = () => (
         <CardHeader
            padding={0}
            display='flex'
            justifyContent='space-between'
            alignItems='center'
         >
            <Text fontSize='lg' fontWeight='semibold'>
               {event.title}
            </Text>
         </CardHeader>
      )
      const timeInputProps = useMemo(
         () => ({
            size: 'sm',
            type: 'datetime-local',
            variant: 'filled',
            width: 'auto',
            fontSize: 'xs',
            borderRadius: 5
         }),
         []
      )

      const startTimeInput = useMemo(() => {
         ;<Input
            {...timeInputProps}
            value={startTime}
            onChange={handleStartTimeChange}
         />
      }, [startTime, handleStartTimeChange, timeInputProps])
      const endTimeInput = useMemo(() => {
         ;<Input
            {...timeInputProps}
            value={endTime}
            onChange={handleEndTimeChange}
         />
      }, [endTime, handleEndTimeChange, timeInputProps])

      const renderModalBody = () => (
         <CardBody h='full'>
            <VStack
               w='full'
               alignItems='flex-start'
               spacing={2}
               color={isTimeValid ? undefined : 'danger.secondary'}
            >
               {startTimeInput}-{endTimeInput}
               <HStack spacing={3} justifyContent='flex-end' paddingTop={2}>
                  <Button variant='ghost' onClick={handleCloseModal}>
                     {t('btn-cancel')}
                  </Button>
                  <Button
                     colorScheme='blue'
                     onClick={handleSave}
                     isDisabled={!isTimeValid}
                  >
                     {t('btn-save')}
                  </Button>
               </HStack>
            </VStack>
         </CardBody>
      )
      const renderModalCard = () => (
         <ScaleFade initialScale={0.9} in={isModalOpen}>
            <Card
               paddingX={6}
               paddingY={4}
               borderRadius={8}
               boxShadow='xl'
               w='500px'
               minW='fit-content'
               maxW='80vw'
            >
               {renderModalHeader()}
               {renderModalBody()}
            </Card>
         </ScaleFade>
      )

      if (!isModalOpen) {
         return null
      }

      return (
         <Box
            position='fixed'
            w={rightWidth}
            h='95%'
            top={20}
            right={0}
            display='flex'
            justifyContent='center'
            alignItems='center'
            overflow='hidden'
         >
            {renderModalOverlay()}
            {renderModalCard()}
         </Box>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
EventEditModal.displayName = 'EventEditModal'

// PropTypes validation
EventEditModal.propTypes = {
   rightWidth: PropTypes.string,
   event: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      start: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
         .isRequired,
      end: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired,
      eventType: PropTypes.oneOf(['task', 'google', 'synced']).isRequired,
      calendarId: PropTypes.string,
      accountEmail: PropTypes.string,
      pura_task_id: PropTypes.string,
      pura_schedule_index: PropTypes.number,
      pageId: PropTypes.string
   }).isRequired,
   updateGoogleEventAction: PropTypes.func.isRequired,
   clearEventEditModalAction: PropTypes.func.isRequired,
   updateTaskScheduleAction: PropTypes.func.isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectEventData = createSelector(
   [(state) => state.event, (state) => state.page._id],
   (eventState, _id) => ({
      id: eventState.id,
      title: eventState.title,
      start: eventState.start,
      end: eventState.end,
      eventType: eventState.eventType,
      calendarId: eventState.calendarId,
      accountEmail: eventState.accountEmail,
      pura_task_id: eventState.pura_task_id,
      pura_schedule_index: eventState.pura_schedule_index,
      pageId: _id
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   event: selectEventData(state)
})

const mapDispatchToProps = {
   updateGoogleEventAction,
   updateTaskScheduleAction,
   clearEventEditModalAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(EventEditModal)
