// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback } from 'react'

// Redux
import { useSelector, useDispatch } from 'react-redux'
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
import {
   PiPlugs,
   PiCircleFill,
   PiStar,
   PiStarFill,
   PiCalendarPlus
} from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../shared/hooks/useReactiveTranslation'

// Actions
import { setAlert } from '../../../ui/alertSlice'
import { toggleCalendarVisibility } from '../../calendarSlice'
import { useSetDefaultAccountMutation, useAddGoogleAccountMutation, useDisconnectGoogleAccountMutation } from '../../api/calendarApi'

// Utils
import { useGoogleAccountLogin } from '../../../../shared/hooks/useGoogleAccountLogin'

// =============================================================================
// SELECTORS
// =============================================================================

const selectSettingsData = createSelector(
   [
      (state) => state.calendarSlice.googleAccounts,
      (state) => state.calendarSlice.googleCalendars,
      (state) => state.calendarSlice.range,
      (state) => state.calendarSlice.defaultAccount
   ],
   (googleAccounts, googleCalendars, range, defaultAccount) => ({
      googleAccounts: googleAccounts || [],
      googleCalendars: googleCalendars || [],
      range: range || [],
      defaultAccount
   })
)


// =============================================================================
// CONSTANTS
// =============================================================================

const ACCOUNT_BUTTON_BASE_STYLES = {
   size: 'md',
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

const Settings = React.memo(() => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()
      const dispatch = useDispatch()

      // Redux selectors
      const { googleAccounts, googleCalendars, range } = useSelector(selectSettingsData)

      // RTK Query hooks
      const [setDefaultAccountMutation, { isLoading: isSettingDefault }] = useSetDefaultAccountMutation()
      const [addGoogleAccountMutation] = useAddGoogleAccountMutation()
      const [disconnectGoogleAccountMutation] = useDisconnectGoogleAccountMutation()

      // -------------------------------------------------------------------------
      // EVENT HANDLERS
      // -------------------------------------------------------------------------

      const googleLogin = useGoogleAccountLogin({
         onSuccess: async (code, range) => {
            await addGoogleAccountMutation({ code, range })
         },
         onError: () => {
            dispatch(setAlert(
               'alert-google_calendar-account-connect_failed',
               '',
               'error'
            ))
         },
         range
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
         (calendarId) => {
            dispatch(toggleCalendarVisibility({ calendarId }))
         },
         [dispatch]
      )

      const handleGoogleReconnect = useCallback(() => {
         googleLogin()
      }, [googleLogin])

      const handleGoogleDisconnect = useCallback(
         async (accountEmail) => {
            await disconnectGoogleAccountMutation({
               accountEmail: accountEmail
            })
         },
         [disconnectGoogleAccountMutation]
      )

      const handleSetDefaultAccount = useCallback(
         async (accountEmail) => {
            if (isSettingDefault) return

            await setDefaultAccountMutation({
               accountEmail: accountEmail
            })

         },
         [setDefaultAccountMutation, isSettingDefault]
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
               display='flex'
               alignItems='center'
               justifyContent='center'
               borderRadius='full'
            >
               <PiStarFill size={12} />
            </Badge>
         )
      }

      const renderSetDefaultButton = (account) => {
         if (account.isDefault) return null

         return (
            <>
               <Divider />
               <MenuItem
                  icon={<PiStar size={18} />}
                  onClick={() => handleSetDefaultAccount(account.accountEmail)}
                  isDisabled={isSettingDefault || !account.accountSyncStatus}
               >
                  {t('btn-set-as-default')}
               </MenuItem>
            </>
         )
      }

      const renderAccountButton = (account) => (
         <Menu key={account.accountEmail} isLazy>
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
                  <Text fontSize='md'>{account.accountEmail}</Text>
                  {renderDefaultAccountBadge(account.isDefault)}
               </Box>
            </MenuButton>
            {renderCalendarOptions(account)}
         </Menu>
      )

      const renderCalendarOptions = (account) => {
         const currentCalendars = googleCalendars.filter(
            (calendar) => calendar.accountEmail === account.accountEmail
         )

         return (
            <MenuList zIndex={10}>
               <MenuOptionGroup
                  title={t('label-my-calendars')}
                  fontSize='md'
                  type='checkbox'
                  defaultValue={visibleCalendars}
               >
                  {!account.accountSyncStatus && (
                     <MenuItem
                        icon={<PiPlugs size={18} />}
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
                              onClick={(e) => {
                                 e.preventDefault()
                                 handleCalendarVisibilityChange(
                                    calendar.calendarId
                                 )
                              }}
                              isChecked={calendar.selected}
                           >
                              <Flex gap={2} alignItems='center'>
                                 <PiCircleFill
                                    color={calendar.color}
                                    size={18}
                                 />
                                 <Text fontSize='md'>{calendar.title}</Text>
                              </Flex>
                           </MenuItemOption>
                        ))}

                        {!account.isDefault && renderSetDefaultButton(account)}
                        {account.accountSyncStatus && (
                           <MenuItem
                              icon={<PiPlugs size={18} />}
                              onClick={(e) => {
                                 e.preventDefault()
                                 handleGoogleDisconnect(account.accountEmail)
                              }}
                           >
                              {t('btn-dis_connect-google_calendar')}
                           </MenuItem>
                        )}
                     </>
                  )}
               </MenuOptionGroup>
            </MenuList>
         )
      }

      const GoogleCalendarGroupTitle = () => (
         <Button size='md' colorScheme='gray' onClick={googleLogin}>
            <Flex w='max-content' gap={3}>
               <PiCalendarPlus size={18} />
               {t('btn-connect-calendar')}
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

// =============================================================================
// EXPORT
// =============================================================================

export default Settings
