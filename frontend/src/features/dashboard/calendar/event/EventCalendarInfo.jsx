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
         <PiCalendar size={18} />
         <Text fontSize='md' color='text.primary'>
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
      accounts = []
   }) => {
      // Filter calendars by available accounts
      const accountEmails = accounts.map(
         (account) => account.email || account.accountEmail
      )
      const availableCalendars =
         accounts.length > 0
            ? calendars.filter((cal) =>
                 accountEmails.includes(cal.accountEmail)
              )
            : calendars

      // Only show writable calendars (owner or writer access)
      const writableCalendars = availableCalendars.filter(
         (cal) => cal.accessRole === 'owner' || cal.accessRole === 'writer'
      )

      // Group calendars by account
      const calendarsByAccount = writableCalendars.reduce((acc, calendar) => {
         if (!acc[calendar.accountEmail]) {
            acc[calendar.accountEmail] = []
         }
         acc[calendar.accountEmail].push(calendar)
         return acc
      }, {})

      return (
         <HStack align='start' spacing={3} w='full'>
            <PiCalendar size={18} />

            <Menu>
               <MenuButton
                  as={Button}
                  w='fit-content'
                  bg='bg.canvas'
                  fontWeight='normal'
                  rightIcon={<PiCaretDown size={12} />}
               >
                  {selectedCalendar.title}
               </MenuButton>
               <MenuList zIndex={10000}>
                  {Object.entries(calendarsByAccount).map(([accountEmail, accountCalendars]) => (
                     <MenuGroup key={accountEmail} title={accountEmail}>
                        {accountCalendars.map((calendar) => (
                           <MenuItem
                              key={calendar.calendarId}
                              onClick={() => setSelectedCalendar(calendar)}
                           >
                              {calendar.title}
                           </MenuItem>
                        ))}
                     </MenuGroup>
                  ))}
               </MenuList>
            </Menu>
            <Menu>
               <MenuButton
                  as={Button}
                  w='fit-content'
                  bg='bg.canvas'
                  rightIcon={<PiCaretDown size={12} />}
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
               <MenuList w='fit-content' minW='fit-content' zIndex={10000}>
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
   selectedCalendar: PropTypes.object,
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
   accounts: PropTypes.arrayOf(
      PropTypes.shape({
         email: PropTypes.string,
         accountEmail: PropTypes.string
      })
   )
}

export default EventCalendarInfo
export { EventCalendarSelect }
