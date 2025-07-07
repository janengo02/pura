// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback } from 'react'
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
   MenuItemOption
} from '@chakra-ui/react'

// Icons & Utils
import { PiPlugs, PiCircleFill } from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// Actions
import {
   changeCalendarVisibilityAction,
   addGoogleAccountAction
} from '../../../../actions/googleAccountActions'

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

const getAccountButtonStyles = (accountSyncStatus) => ({
   ...ACCOUNT_BUTTON_BASE_STYLES,
   colorScheme: accountSyncStatus ? 'purple' : 'gray',
   color: accountSyncStatus ? undefined : 'gray.500'
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
      settingsData: { googleAccounts, googleCalendars, range }
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()

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

      // -------------------------------------------------------------------------
      // RENDER HELPERS
      // -------------------------------------------------------------------------

      const renderAccountButton = (account) => (
         <MenuButton
            key={account.accountId}
            as={Button}
            {...getAccountButtonStyles(account.accountSyncStatus)}
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
               {account.accountEmail}
            </Box>
         </MenuButton>
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

                  {currentCalendars.map((calendar) => (
                     <MenuItemOption
                        key={calendar.calendarId}
                        value={calendar.calendarId}
                        fontSize='sm'
                        onClick={(e) => {
                           e.preventDefault()
                           handleCalendarVisibilityChange(calendar.calendarId)
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
         )
      }

      const GoogleCalendarGroupTitle = () => (
         <Flex w='max-content' gap={3}>
            <Image src='assets/img/logos--google-calendar.svg' />
            {t('label-google_calendar')}
         </Flex>
      )

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      return (
         <>
            {/* Google Account Menus */}
            {googleAccounts.map((account) => (
               <Menu key={account.accountId} isLazy>
                  {renderAccountButton(account)}
                  {renderCalendarOptions(account)}
               </Menu>
            ))}
            <Button size='sm' colorScheme='gray' onClick={googleLogin}>
               <GoogleCalendarGroupTitle />
            </Button>
         </>
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
   settingsData: PropTypes.shape({
      googleAccounts: PropTypes.array.isRequired,
      googleCalendars: PropTypes.array.isRequired,
      range: PropTypes.array.isRequired
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectSettingsData = createSelector(
   [
      (state) => state.googleAccount.googleAccounts,
      (state) => state.googleAccount.googleCalendars,
      (state) => state.googleAccount.range
   ],
   (googleAccounts, googleCalendars, range) => ({
      googleAccounts: googleAccounts || [],
      googleCalendars: googleCalendars || [],
      range: range || []
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
   addGoogleAccountAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
