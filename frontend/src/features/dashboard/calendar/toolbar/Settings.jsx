import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import {
   IconButton,
   Menu,
   MenuButton,
   MenuList,
   MenuItem,
   MenuGroup,
   Image,
   Flex,
   MenuOptionGroup,
   MenuItemOption,
   Box
} from '@chakra-ui/react'
import {
   PiSlidersHorizontalFill,
   PiPlus,
   PiCircleFill,
   PiPlugs
} from 'react-icons/pi'
import t from '../../../../lang/i18n'
import { useGoogleLogin } from '@react-oauth/google'
import {
   addGoogleAccountAction,
   changeCalendarVisibilityAction
} from '../../../../actions/googleAccountActions'

const GoogleCalendarGroupTitle = () => (
   <Flex w='full' gap={3}>
      <Image src='assets/img/logos--google-calendar.svg' />
      {t('label-google_calendar')}
   </Flex>
)
const Settings = ({
   // Redux props
   addGoogleAccountAction,
   changeCalendarVisibilityAction,
   googleAccount: { range, googleCalendars, googleAccounts }
}) => {
   const googleLogin = useGoogleLogin({
      onSuccess: (tokenResponse) => {
         const { code } = tokenResponse
         addGoogleAccountAction({ code, range }).then(() => {})
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

   return (
      <>
         {googleAccounts.map((account) => {
            const currentCalendars = googleCalendars.filter(
               (c) => c.accountId === account.accountId
            )
            const visibleCalendars = currentCalendars.map(
               (c) => c.selected && c.calendarId
            )
            return (
               <Menu isLazy closeOnSelect={false}>
                  <MenuButton
                     as={IconButton}
                     size='sm'
                     variant='outline'
                     colorScheme={account.accountSyncStatus ? 'purple' : 'gray'}
                     color={account.accountSyncStatus ? undefined : 'gray.500'}
                     px={4}
                  >
                     <Box
                        display='flex'
                        flexDirection='row'
                        gap={2}
                        justifyContent='center'
                        alignContent='center'
                     >
                        {account.accountSyncStatus ? (
                           <Image
                              src={
                                 'assets/img/logos--google-calendar-synced.svg'
                              }
                              size={10}
                           />
                        ) : (
                           <Image
                              src={
                                 'assets/img/logos--google-calendar-not-synced.svg'
                              }
                              size={10}
                           />
                        )}

                        {account.accountEmail}
                     </Box>
                  </MenuButton>
                  <MenuList zIndex={10}>
                     <MenuOptionGroup
                        title='My calendars'
                        fontSize='sm'
                        type='checkbox'
                        defaultValue={visibleCalendars}
                     >
                        {!account.accountSyncStatus && (
                           <MenuItem
                              icon={<PiPlugs />}
                              onClick={() => {
                                 googleLogin()
                              }}
                           >
                              {t('btn-re_connect-google_calendar')}
                           </MenuItem>
                        )}
                        {currentCalendars.map((calendar) => (
                           <MenuItemOption
                              key={calendar.calendarId}
                              value={calendar.calendarId}
                              fontSize='sm'
                              onClick={async (e) => {
                                 e.preventDefault()
                                 changeCalendarVisibilityAction(
                                    calendar.calendarId
                                 )
                              }}
                              isChecked={calendar.selected}
                           >
                              <Flex alignItems='center' gap={2}>
                                 <PiCircleFill
                                    size={18}
                                    color={calendar.color}
                                 />
                                 {calendar.title}
                              </Flex>
                           </MenuItemOption>
                        ))}
                     </MenuOptionGroup>
                  </MenuList>
               </Menu>
            )
         })}
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
                  <MenuItem
                     icon={<PiPlus />}
                     onClick={() => {
                        googleLogin()
                     }}
                  >
                     {t('btn-connect-google_calendar')}
                  </MenuItem>
               </MenuGroup>
            </MenuList>
         </Menu>
      </>
   )
}

Settings.propTypes = {
   addGoogleAccountAction: PropTypes.func.isRequired,
   changeCalendarVisibilityAction: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   googleAccount: state.googleAccount
})

export default connect(mapStateToProps, {
   addGoogleAccountAction,
   changeCalendarVisibilityAction
})(Settings)
