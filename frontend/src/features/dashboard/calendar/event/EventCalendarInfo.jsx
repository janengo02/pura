// =============================================================================
// EVENT CALENDAR INFO COMPONENT
// =============================================================================

import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import {
   HStack,
   Text,
   Menu,
   MenuButton,
   MenuList,
   MenuItem,
   Button,
   MenuGroup,
   Circle
} from '@chakra-ui/react'
import { PiCalendar, PiCaretDown } from 'react-icons/pi'
import { GOOGLE_CALENDAR_COLORS } from '../../../../components/data/defaultColor'

const EventCalendarInfo = ({ calendar }) => {
   if (!calendar) return null

   return (
      <HStack spacing={3}>
         <PiCalendar size={16} />
         <Text fontSize='sm' color='text.primary'>
            {calendar}
         </Text>
      </HStack>
   )
}

EventCalendarInfo.propTypes = {
   calendar: PropTypes.string
}

// =============================================================================
// EVENT CALENDAR SELECT COMPONENT
// =============================================================================

const EventCalendarSelect = React.memo(
   ({
      selectedCalendar,
      setSelectedCalendar,
      selectedColorId,
      setSelectedColorId,
      calendars = [],
      accountEmail
   }) => {
      // Filter calendars by account email if provided
      const availableCalendars = accountEmail
         ? calendars.filter((cal) => cal.accountEmail === accountEmail)
         : calendars

      // Only show writable calendars (owner or writer access)
      const writableCalendars = availableCalendars.filter(
         (cal) => cal.accessRole === 'owner' || cal.accessRole === 'writer'
      )

      useEffect(() => {
         setSelectedColorId(null) // Reset color to the calendar's default color
      }, [selectedCalendar, setSelectedColorId])

      return (
         <HStack align='start' spacing={3} w='full'>
            <PiCalendar size={16} />

            <Menu>
               <MenuButton
                  as={Button}
                  w='fit-content'
                  bg='bg.canvas'
                  rightIcon={<PiCaretDown size={16} />}
               >
                  {selectedCalendar.title}
               </MenuButton>
               <MenuList>
                  {writableCalendars.map((calendar) => (
                     <MenuItem
                        key={calendar.calendarId}
                        onClick={() => setSelectedCalendar(calendar)}
                     >
                        {calendar.title}
                     </MenuItem>
                  ))}
               </MenuList>
            </Menu>
            <Menu>
               <MenuButton
                  as={Button}
                  w='fit-content'
                  bg='bg.canvas'
                  rightIcon={<PiCaretDown size={16} />}
               >
                  <Circle
                     size='20px'
                     bg={
                        selectedColorId &&
                        Object.keys(GOOGLE_CALENDAR_COLORS).includes(
                           selectedColorId
                        )
                           ? GOOGLE_CALENDAR_COLORS[selectedColorId]
                           : selectedCalendar.color
                     }
                  />
               </MenuButton>
               <MenuList w='fit-content' minW='fit-content'>
                  <MenuGroup w='fit-content' minW='fit-content'>
                     <HStack
                        as='div'
                        wrap='wrap'
                        spacing={0}
                        gap={0}
                        w='fit-content'
                        style={{
                           display: 'grid',
                           gridTemplateColumns: 'repeat(2, 1fr)',
                           gap: 0
                        }}
                     >
                        {Object.keys(GOOGLE_CALENDAR_COLORS).map((colorId) => (
                           <MenuItem
                              key={colorId}
                              onClick={() => setSelectedColorId(colorId)}
                              w='fit-content'
                           >
                              <Circle
                                 size='20px'
                                 bg={GOOGLE_CALENDAR_COLORS[colorId]}
                              />
                           </MenuItem>
                        ))}
                        <MenuItem
                           key={selectedCalendar.color}
                           onClick={() => setSelectedColorId(null)}
                           w='fit-content'
                        >
                           <Circle size='20px' bg={selectedCalendar.color} />
                        </MenuItem>
                     </HStack>
                  </MenuGroup>
               </MenuList>
            </Menu>
         </HStack>
      )
   }
)

EventCalendarSelect.propTypes = {
   selectedCalendar: PropTypes.string,
   setSelectedCalendar: PropTypes.func.isRequired,
   selectedColorId: PropTypes.string,
   setSelectedColorId: PropTypes.func.isRequired,
   calendars: PropTypes.arrayOf(
      PropTypes.shape({
         calendarId: PropTypes.string.isRequired,
         title: PropTypes.string.isRequired,
         accountEmail: PropTypes.string.isRequired,
         accessRole: PropTypes.string.isRequired
      })
   ),
   accountEmail: PropTypes.string
}

export default EventCalendarInfo
export { EventCalendarSelect }
