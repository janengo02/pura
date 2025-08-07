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
import {
   PiPlugs,
   PiCircleFill,
   PiStar,
   PiStarFill,
   PiCalendarPlus
} from 'react-icons/pi'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

// Actions
import {
   changeCalendarVisibilityAction,
   addGoogleAccountAction,
   disconnectGoogleAccountAction,
   setDefaultGoogleAccountAction
} from '../../../../actions/calendarActions'
import { setAlertAction } from '../../../../actions/alertActions'
import { showTaskModalAction } from '../../../../actions/taskActions'

// Utils
import { useGoogleAccountLogin } from '../../../../utils/googleAuthHelpers'

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

const Settings = React.memo(
   ({
      // Redux props
      changeCalendarVisibilityAction,
      addGoogleAccountAction,
      disconnectGoogleAccountAction,
      setDefaultGoogleAccountAction,
      setAlertAction,
      showTaskModalAction,
      settingsData: { googleAccounts, googleCalendars, range, defaultAccount },
      taskData: { task, pageId }
   }) => {
      // -------------------------------------------------------------------------
      // HOOKS & STATE
      // -------------------------------------------------------------------------
      const { t } = useReactiveTranslation()
      const [isSettingDefault, setIsSettingDefault] = useState(false)

      // -------------------------------------------------------------------------
      // TASK MODAL REFRESH HELPER
      // -------------------------------------------------------------------------

      const refetchTaskModalIfOpen = useCallback(async () => {
         // Check if task modal is displayed (task exists in state)
         if (task && pageId) {
            const formData = {
               page_id: pageId,
               task_id: task._id
            }
            await showTaskModalAction(formData)
         }
      }, [task, pageId, showTaskModalAction])

      const googleLogin = useGoogleAccountLogin({
         onSuccess: async (code, range) => {
            await addGoogleAccountAction({ code, range })
            // Refetch task modal data if open after successful Google account connection
            await refetchTaskModalIfOpen()
         },
         onError: () => {
            setAlertAction(
               'alert-google_calendar-account-connect_failed',
               '',
               'error'
            )
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
         async (calendarId) => {
            await changeCalendarVisibilityAction(calendarId)
         },
         [changeCalendarVisibilityAction]
      )

      const handleGoogleReconnect = useCallback(() => {
         googleLogin()
      }, [googleLogin])

      const handleGoogleDisconnect = useCallback(
         async (accountEmail) => {
            await disconnectGoogleAccountAction({
               account_email: accountEmail
            })
            // Refetch task modal data if open after disconnecting Google account
            await refetchTaskModalIfOpen()
         },
         [disconnectGoogleAccountAction, refetchTaskModalIfOpen]
      )

      const handleSetDefaultAccount = useCallback(
         async (accountEmail) => {
            if (isSettingDefault) return

            setIsSettingDefault(true)
            try {
               await setDefaultGoogleAccountAction({
                  account_email: accountEmail
               })
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
         if (account.isDefault || googleAccounts.length === 1) return null

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

// PropTypes validation
Settings.propTypes = {
   changeCalendarVisibilityAction: PropTypes.func.isRequired,
   addGoogleAccountAction: PropTypes.func.isRequired,
   disconnectGoogleAccountAction: PropTypes.func.isRequired,
   setDefaultGoogleAccountAction: PropTypes.func.isRequired,
   setAlertAction: PropTypes.func.isRequired,
   showTaskModalAction: PropTypes.func.isRequired,
   settingsData: PropTypes.shape({
      googleAccounts: PropTypes.array.isRequired,
      googleCalendars: PropTypes.array.isRequired,
      range: PropTypes.array.isRequired,
      defaultAccount: PropTypes.object
   }).isRequired,
   taskData: PropTypes.shape({
      task: PropTypes.object,
      pageId: PropTypes.string
   }).isRequired
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

const selectSettingsData = createSelector(
   [
      (state) => state.calendar.googleAccounts,
      (state) => state.calendar.googleCalendars,
      (state) => state.calendar.range,
      (state) => state.calendar.defaultAccount
   ],
   (googleAccounts, googleCalendars, range, defaultAccount) => ({
      googleAccounts: googleAccounts || [],
      googleCalendars: googleCalendars || [],
      range: range || [],
      defaultAccount
   })
)

const selectTaskData = createSelector(
   [(state) => state.task.task, (state) => state.page._id],
   (task, pageId) => ({
      task,
      pageId
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   settingsData: selectSettingsData(state),
   taskData: selectTaskData(state)
})

const mapDispatchToProps = {
   changeCalendarVisibilityAction,
   addGoogleAccountAction,
   disconnectGoogleAccountAction,
   setDefaultGoogleAccountAction,
   setAlertAction,
   showTaskModalAction
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Settings)
