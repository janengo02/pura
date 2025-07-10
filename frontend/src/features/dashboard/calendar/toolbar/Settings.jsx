// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback, useState } from 'react'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// UI Components
import {
   Box,
   Button,
   Flex,
   Image,
   Menu,
   MenuButton,
   MenuList,
   MenuItem,
   MenuOptionGroup,
   MenuItemOption,
   Text,
   Divider,
   Badge
} from '@chakra-ui/react'

// Icons & Utils
import { PiPlugs, PiCircleFill, PiStar, PiStarFill } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// Actions
import {
   changeCalendarVisibilityAction,
   addGoogleAccountAction,
   setDefaultGoogleAccountAction
} from '../../../../actions/googleAccountActions'
import { setAlertAction } from '../../../../actions/alertActions'

// Hooks
import { useGoogleLogin } from '@react-oauth/google'

// =============================================================================
// CONSTANTS
// =============================================================================

const ACCOUNT_BUTTON_BASE_STYLES = {
   size: 'sm',
   px: 4,
   variant: 'outline'
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const getAccountButtonStyles = (accountSyncStatus, isDefault) => ({
   ...ACCOUNT_BUTTON_BASE_STYLES,
   colorScheme: accountSyncStatus ? (isDefault ? 'purple' : 'blue') : 'gray',
   color: accountSyncStatus ? undefined : 'text.secondary',
   borderWidth: isDefault ? 2 : 1
})

const getAccountImage = (accountSyncStatus) =>
   accountSyncStatus
      ? 'assets/img/logos--google-calendar-synced.svg'
      : 'assets/img/logos--google-calendar-not-synced.svg'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Settings = React.memo(
   ({
      // Redux props
      changeCalendarVisibilityAction,
      addGoogleAccountAction,
      setDefaultGoogleAccountAction,
      setAlertAction,
      settingsData: { googleAccounts, googleCalendars, range, defaultAccount }
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()
      const [isSettingDefault, setIsSettingDefault] = useState(false)

      const googleLogin = useGoogleLogin({
         onSuccess: (tokenResponse) => {
            const { code } = tokenResponse
            addGoogleAccountAction({ code, range }).then(() => {})
         },
         onError: (responseError) => {
            setAlertAction(
               'alert-google_calendar-account-connect_failed',
               '',
               'error'
            )
         },
         onNonOAuthError: (responseError) => {
            setAlertAction(
               'alert-google_calendar-account-connect_failed',
               '',
               'error'
            )
         },
         scope: 'openid email profile https://www.googleapis.com/auth/calendar',
         flow: 'auth-code',
         auto_select: true
      })

      // -------------------------------------------------------------------------
      // MEMOIZED VALUES
      // -------------------------------------------------------------------------

      const visibleCalendars = useMemo(
         () =>
            googleCalendars
               .filter((calendar) => calendar.selected)
               .map((calendar) => calendar.calendarId),
         [googleCalendars]
      )

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const handleCalendarVisibilityChange = useCallback(
         async (calendarId) => {
            await changeCalendarVisibilityAction(calendarId)
         },
         [changeCalendarVisibilityAction]
      )

      const handleGoogleReconnect = useCallback(() => {
         googleLogin()
      }, [googleLogin])

      const handleSetDefaultAccount = useCallback(
         async (accountId) => {
            if (isSettingDefault) return

            setIsSettingDefault(true)
            try {
               await setDefaultGoogleAccountAction({ account_id: accountId })
            } finally {
               setIsSettingDefault(false)
            }
         },
         [setDefaultGoogleAccountAction, isSettingDefault]
      )

      // -------------------------------------------------------------------------
      // RENDER HELPERS
      // -------------------------------------------------------------------------

      const renderDefaultAccountBadge = (isDefault) => {
         if (!isDefault) return null

         return (
            <Badge
               colorScheme='purple'
               variant='solid'
               fontSize='xs'
               ml={1}
               display='flex'
               alignItems='center'
               gap={1}
            >
               <PiStarFill size={10} />
               {t('label-default')}
            </Badge>
         )
      }

      const renderSetDefaultButton = (account) => {
         if (account.isDefault || googleAccounts.length === 1) return null

         return (
            <MenuItem
               icon={<PiStar />}
               onClick={() => handleSetDefaultAccount(account.accountId)}
               isDisabled={isSettingDefault || !account.accountSyncStatus}
            >
               {t('btn-set-as-default')}
            </MenuItem>
         )
      }

      const renderAccountButton = (account) => (
         <Menu key={account.accountId} isLazy>
            <MenuButton
               as={Button}
               {...getAccountButtonStyles(
                  account.accountSyncStatus,
                  account.isDefault
               )}
            >
               <Box
                  display='flex'
                  flexDirection='row'
                  gap={2}
                  justifyContent='center'
                  alignContent='center'
               >
                  <Image
                     src={getAccountImage(account.accountSyncStatus)}
                     size={10}
                     alt='Google Calendar Status'
                  />
                  <Flex direction='column' align='start'>
                     <Text fontSize='sm'>{account.accountEmail}</Text>
                     {renderDefaultAccountBadge(account.isDefault)}
                  </Flex>
               </Box>
            </MenuButton>
            {renderCalendarOptions(account)}
         </Menu>
      )

      const renderCalendarOptions = (account) => {
         const currentCalendars = googleCalendars.filter(
            (calendar) => calendar.accountId === account.accountId
         )

         return (
            <MenuList zIndex={10}>
               <MenuOptionGroup
                  title={t('label-my-calendars')}
                  fontSize='sm'
                  type='checkbox'
                  defaultValue={visibleCalendars}
               >
                  {!account.accountSyncStatus && (
                     <MenuItem
                        icon={<PiPlugs />}
                        onClick={handleGoogleReconnect}
                     >
                        {t('btn-re_connect-google_calendar')}
                     </MenuItem>
                  )}

                  {account.accountSyncStatus && currentCalendars.length > 0 && (
                     <>
                        {currentCalendars.map((calendar) => (
                           <MenuItemOption
                              key={calendar.calendarId}
                              value={calendar.calendarId}
                              onChange={() =>
                                 handleCalendarVisibilityChange(
                                    calendar.calendarId
                                 )
                              }
                           >
                              <Flex gap={2} alignItems='center'>
                                 <PiCircleFill
                                    color={calendar.color}
                                    size={18}
                                 />
                                 <Text fontSize='sm'>{calendar.title}</Text>
                              </Flex>
                           </MenuItemOption>
                        ))}

                        {googleAccounts.length > 1 && (
                           <>
                              <Divider />
                              {renderSetDefaultButton(account)}
                           </>
                        )}
                     </>
                  )}
               </MenuOptionGroup>
            </MenuList>
         )
      }

      const GoogleCalendarGroupTitle = () => (
         <Button size='sm' colorScheme='gray' onClick={googleLogin}>
            <Flex w='max-content' gap={3}>
               <Image src='assets/img/logos--google-calendar.svg' />
               {t('label-google_calendar')}
            </Flex>
         </Button>
      )

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <Flex gap={3} alignItems='center' flexWrap='wrap'>
            {googleAccounts.map(renderAccountButton)}

            {GoogleCalendarGroupTitle()}
         </Flex>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Settings.displayName = 'CalendarSettings'

// PropTypes validation
Settings.propTypes = {
   changeCalendarVisibilityAction: PropTypes.func.isRequired,
   addGoogleAccountAction: PropTypes.func.isRequired,
   setDefaultGoogleAccountAction: PropTypes.func.isRequired,
   setAlertAction: PropTypes.func.isRequired,
   settingsData: PropTypes.shape({
      googleAccounts: PropTypes.array.isRequired,
      googleCalendars: PropTypes.array.isRequired,
      range: PropTypes.array.isRequired,
      defaultAccount: PropTypes.object
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectSettingsData = createSelector(
   [
      (state) => state.googleAccount.googleAccounts,
      (state) => state.googleAccount.googleCalendars,
      (state) => state.googleAccount.range,
      (state) => state.googleAccount.defaultAccount
   ],
   (googleAccounts, googleCalendars, range, defaultAccount) => ({
      googleAccounts: googleAccounts || [],
      googleCalendars: googleCalendars || [],
      range: range || [],
      defaultAccount
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   settingsData: selectSettingsData(state)
})

const mapDispatchToProps = {
   changeCalendarVisibilityAction,
   addGoogleAccountAction,
   setDefaultGoogleAccountAction,
   setAlertAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
