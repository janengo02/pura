// =============================================================================
// EVENT REMINDERS COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { VStack, HStack, Text, Badge } from '@chakra-ui/react'
import { PiBell } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventReminders = ({ reminders }) => {
   const { t } = useReactiveTranslation()

   if (!reminders) return null

   if (
      reminders.useDefault &&
      (!reminders.overrides || reminders.overrides.length === 0)
   ) {
      return (
         <HStack spacing={2} mb={2}>
            <PiBell size={16} color='gray.500' />
            <Text fontSize='sm' color='text.primary'>
               {t('event-default-reminders')}
            </Text>
         </HStack>
      )
   }

   if (!reminders.overrides || reminders.overrides.length === 0) return null

   return (
      <VStack align='start' spacing={2} mb={3}>
         <HStack spacing={2}>
            <PiBell size={16} color='gray.500' />
            <Text fontSize='sm' fontWeight='medium' color='text.primary'>
               {t('event-reminders')}
            </Text>
         </HStack>
         <VStack align='start' spacing={1}>
            {reminders.overrides.map((reminder, index) => {
               const timeText =
                  reminder.minutes < 60
                     ? t('reminder-minutes', { minutes: reminder.minutes })
                     : t('reminder-hours', {
                          hours: Math.floor(reminder.minutes / 60)
                       })

               return (
                  <HStack key={index} spacing={2}>
                     <Badge
                        size='sm'
                        colorScheme={
                           reminder.method === 'email' ? 'blue' : 'orange'
                        }
                     >
                        {reminder.method === 'email'
                           ? t('reminder-email')
                           : t('reminder-popup')}
                     </Badge>
                     <Text fontSize='sm' color='text.primary'>
                        {timeText}
                     </Text>
                  </HStack>
               )
            })}
         </VStack>
      </VStack>
   )
}

EventReminders.propTypes = {
   reminders: PropTypes.shape({
      useDefault: PropTypes.bool,
      overrides: PropTypes.arrayOf(
         PropTypes.shape({
            method: PropTypes.oneOf(['email', 'popup']),
            minutes: PropTypes.number
         })
      )
   })
}

export default EventReminders
