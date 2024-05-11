import React from 'react'
import { connect } from 'react-redux'
import PropTypes from 'prop-types'

import {
   IconButton,
   Menu,
   MenuButton,
   MenuList,
   MenuItem
} from '@chakra-ui/react'
import { PiSlidersHorizontalFill, PiGoogleLogoBold } from 'react-icons/pi'
import t from '../../../../lang/i18n'

import { useGoogleLogin } from '@react-oauth/google'
import { createGoogleTokens } from '../../../../actions/googleAccount'

const Settings = ({ createGoogleTokens }) => {
   const googleLogin = useGoogleLogin({
      onSuccess: (tokenResponse) => {
         const { code } = tokenResponse
         createGoogleTokens({ code })
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
         <MenuList>
            <MenuItem
               icon={<PiGoogleLogoBold size={20} />}
               onClick={() => {
                  googleLogin()
               }}
            >
               {t('btn-connect-google-calendar')}
            </MenuItem>
         </MenuList>
      </Menu>
   )
}

Settings.propTypes = {
   createGoogleTokens: PropTypes.func.isRequired
}

export default connect(null, { createGoogleTokens })(Settings)
