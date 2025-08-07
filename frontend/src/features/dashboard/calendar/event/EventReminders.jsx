// =============================================================================
// EVENT REMINDERS COMPONENT
// =============================================================================

import React from 'react'
import PropTypes from 'prop-types'
import { VStack, HStack, Text, Badge } from '@chakra-ui/react'
import { PiBell } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventReminders = ({ reminders, eventStart }) => {
   const { t } = useReactiveTranslation()

   if (!reminders) return null

   if (reminders.useDefault) {
      return null
   }

   if (!reminders.overrides || reminders.overrides.length === 0) return null

   return (
      <HStack spacing={3}>
         <PiBell size={18} color='gray.500' />
         <VStack align='start' spacing={1}>
            {reminders.overrides.map((reminder, index) => {
               const getTimeText = (minutes) => {
                  if (!eventStart) {
                     // Fallback to original logic if no eventStart provided
                     if (minutes < 60) {
                        const key =
                           minutes === 1
                              ? 'desc-reminder-minute'
                              : 'desc-reminder-minutes'
                        return t(key, { minutes })
                     } else if (minutes < 1440) {
                        const hours = Math.floor(minutes / 60)
                        const key =
                           hours === 1 ? 'desc-reminder-hour' : 'desc-reminder-hours'
                        return t(key, { hours })
                     } else {
                        const days = Math.floor(minutes / 1440)
                        // Only use weeks if it falls exactly on week boundaries
                        const exactWeeks = days / 7
                        const isExactWeeks =
                           exactWeeks === Math.floor(exactWeeks)

                        if (isExactWeeks && days >= 7) {
                           const weeks = Math.floor(exactWeeks)
                           const key =
                              weeks === 1 ? 'desc-reminder-week' : 'desc-reminder-weeks'
                           return t(key, { weeks })
                        } else {
                           const key =
                              days === 1 ? 'desc-reminder-day' : 'desc-reminder-days'
                           return t(key, { days })
                        }
                     }
                  }

                  const eventDate = new Date(eventStart)
                  const reminderDate = new Date(
                     eventDate.getTime() - minutes * 60 * 1000
                  )

                  // Check if reminder is on the same day as event
                  const isSameDay =
                     eventDate.toDateString() === reminderDate.toDateString()

                  if (minutes < 60) {
                     const key =
                        minutes === 1 ? 'desc-reminder-minute' : 'desc-reminder-minutes'
                     return t(key, { minutes })
                  } else if (isSameDay) {
                     // Same day - show hours before
                     const hours = Math.floor(minutes / 60)
                     const key =
                        hours === 1 ? 'desc-reminder-hour' : 'desc-reminder-hours'
                     return t(key, { hours })
                  } else {
                     // Different day - calculate day difference and show time
                     const dayDiff = Math.ceil(minutes / 1440)
                     const timeString = reminderDate.toLocaleTimeString([], {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                     })

                     if (dayDiff === 1) {
                        return t('desc-reminder-day-before-at', {
                           time: timeString
                        })
                     } else {
                        // Check if reminder time matches event start time
                        const reminderTime =
                           reminderDate.getHours() * 60 +
                           reminderDate.getMinutes()
                        const eventTime =
                           eventDate.getHours() * 60 + eventDate.getMinutes()
                        const isSameTime = reminderTime === eventTime

                        // Check if reminder falls exactly on a week boundary
                        const exactWeeks = dayDiff / 7
                        const isExactWeeks =
                           exactWeeks === Math.floor(exactWeeks)

                        if (isExactWeeks && dayDiff >= 7) {
                           const weeks = Math.floor(exactWeeks)
                           if (isSameTime) {
                              const key =
                                 weeks === 1
                                    ? 'desc-reminder-week'
                                    : 'desc-reminder-weeks'
                              return t(key, { weeks })
                           } else {
                              const key =
                                 weeks === 1
                                    ? 'desc-reminder-week-before-at'
                                    : 'desc-reminder-weeks-before-at'
                              return t(key, { weeks, time: timeString })
                           }
                        } else {
                           if (isSameTime) {
                              const key =
                                 dayDiff === 1
                                    ? 'desc-reminder-day'
                                    : 'desc-reminder-days'
                              return t(key, { days: dayDiff })
                           } else {
                              const key =
                                 dayDiff === 1
                                    ? 'desc-reminder-day-before-at'
                                    : 'desc-reminder-days-before-at'
                              return t(key, {
                                 days: dayDiff,
                                 time: timeString
                              })
                           }
                        }
                     }
                  }
               }

               const timeText = getTimeText(reminder.minutes)

               return (
                  <HStack key={index} spacing={2}>
                     <Text fontSize='md' color='text.primary'>
                        {timeText}
                     </Text>
                     {reminder.method === 'email' && (
                        <Badge size='md' colorScheme='blue'>
                           {t('label-reminder-email')}
                        </Badge>
                     )}
                  </HStack>
               )
            })}
         </VStack>
      </HStack>
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
   }),
   eventStart: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
}

export default EventReminders
