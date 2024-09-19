import React, { useState } from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import {
   IconButton,
   Menu,
   MenuButton,
   MenuList,
   MenuItem,
   MenuGroup,
   MenuDivider,
   Text,
   Image,
   Flex,
   MenuOptionGroup,
   MenuItemOption
} from '@chakra-ui/react'
import { PiSlidersHorizontalFill, PiPlus, PiCircleFill } from 'react-icons/pi'
import t from '../../../../lang/i18n'

import { useGoogleLogin } from '@react-oauth/google'
import {
   createGoogleTokens,
   setVisibleCalendar
} from '../../../../actions/googleAccount'

const GoogleCalendarGroupTitle = () => (
   <Flex w='full' gap={3}>
      <Image src='assets/img/logos--google-calendar.svg' />
      {t('label-google_calendar')}
   </Flex>
)
const Settings = ({
   // Redux props
   createGoogleTokens,
   setVisibleCalendar,
   googleAccount: { isLoggedIn, account, range, googleCalendars },
   tasks
}) => {
   const googleLogin = useGoogleLogin({
      onSuccess: (tokenResponse) => {
         const { code } = tokenResponse
         createGoogleTokens({ code, range, tasks }).then(() => {})
      },
      // TODO Error Handling
      onError: (responseError) => {
         console.log('onError', responseError)
      },
      onNonOAuthError: (responseError) => {
         console.log('onNonOAuthError', responseError)
      },
      scope: 'openid email profile https://www.googleapis.com/auth/calendar',
      flow: 'auth-code',
      auto_select: true
   })
   const visibleCalendars = googleCalendars.map(
      (c) => c.selected && c.calendarId
   )
   return (
      <Menu isLazy closeOnSelect={false}>
         <MenuButton
            as={IconButton}
            icon={<PiSlidersHorizontalFill size={22} />}
            variant='ghost'
            size='sm'
            colorScheme='gray'
         ></MenuButton>
         <MenuList zIndex={10}>
            <MenuGroup title={<GoogleCalendarGroupTitle />}>
               {isLoggedIn && account && (
                  <Text marginX={4} color='gray.400'>
                     {account}
                  </Text>
               )}
               <MenuItem
                  icon={<PiPlus />}
                  onClick={() => {
                     googleLogin()
                  }}
               >
                  {t('btn-connect-google_calendar')}
               </MenuItem>
            </MenuGroup>
            <MenuDivider />
            <MenuOptionGroup
               title='My calendars'
               fontSize='sm'
               type='checkbox'
               defaultValue={visibleCalendars}
            >
               {googleCalendars.map((calendar) => (
                  <MenuItemOption
                     key={calendar.calendarId}
                     value={calendar.calendarId}
                     fontSize='sm'
                     onClick={async (e) => {
                        e.preventDefault()
                        setVisibleCalendar(calendar.calendarId)
                     }}
                     isChecked={calendar.selected}
                  >
                     <Flex alignItems='center' gap={2}>
                        <PiCircleFill size={18} color={calendar.color} />
                        {calendar.title}
                     </Flex>
                  </MenuItemOption>
               ))}
            </MenuOptionGroup>
         </MenuList>
      </Menu>
   )
}

Settings.propTypes = {
   createGoogleTokens: PropTypes.func.isRequired,
   setVisibleCalendar: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired,
   tasks: PropTypes.array.isRequired
}

const mapStateToProps = (state) => ({
   googleAccount: state.googleAccount,
   tasks: state.page.tasks
})

export default connect(mapStateToProps, {
   createGoogleTokens,
   setVisibleCalendar
})(Settings)
