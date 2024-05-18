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
   Flex
} from '@chakra-ui/react'
import { PiSlidersHorizontalFill, PiPlus } from 'react-icons/pi'
import t from '../../../../lang/i18n'

import { useGoogleLogin } from '@react-oauth/google'
import { createGoogleTokens } from '../../../../actions/googleAccount'

const GoogleCalendarGroupTitle = () => (
   <Flex w='full' gap={3}>
      <Image src='assets/img/logos--google-calendar.svg' />
      {t('label-google_calendar')}
   </Flex>
)
const Settings = ({
   // Redux props
   createGoogleTokens,
   googleAccount: { isLoggedIn, account }
}) => {
   const googleLogin = useGoogleLogin({
      onSuccess: (tokenResponse) => {
         const { code } = tokenResponse
         createGoogleTokens({ code }).then(() => {})
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
      <Menu isLazy>
         <MenuButton
            as={IconButton}
            icon={<PiSlidersHorizontalFill size={22} />}
            variant='ghost'
            size='sm'
            colorScheme='gray'
         ></MenuButton>
         <MenuList zIndex={10}>
            <MenuGroup title={<GoogleCalendarGroupTitle />}>
               {isLoggedIn ? (
                  <Text marginX={4} color='gray.400'>
                     {account}
                  </Text>
               ) : (
                  <MenuItem
                     icon={<PiPlus />}
                     onClick={() => {
                        googleLogin()
                     }}
                  >
                     {t('btn-connect-google_calendar')}
                  </MenuItem>
               )}
            </MenuGroup>
            <MenuDivider />
            <MenuGroup title='Settings'></MenuGroup>
         </MenuList>
      </Menu>
   )
}

Settings.propTypes = {
   createGoogleTokens: PropTypes.func.isRequired,
   googleAccount: PropTypes.object.isRequired
}

const mapStateToProps = (state) => ({
   googleAccount: state.googleAccount
})

export default connect(mapStateToProps, { createGoogleTokens })(Settings)
