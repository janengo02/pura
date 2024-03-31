import React from 'react'
import {
   IconButton,
   Menu,
   MenuButton,
   MenuList,
   MenuItem
} from '@chakra-ui/react'
import { PiSlidersHorizontalFill, PiGoogleLogoBold } from 'react-icons/pi'
import t from '../../../../lang/i18n'

import { useGoogleOneTapLogin } from '@react-oauth/google'
import { hasGrantedAnyScopeGoogle } from '@react-oauth/google'

const Settings = () => {
   const login = useGoogleOneTapLogin({
      onSuccess: (tokenResponse) => {
         const hasAccess = hasGrantedAnyScopeGoogle(
            tokenResponse,
            'google-scope-1',
            'google-scope-2'
         )
         console.log(tokenResponse)
         console.log(hasAccess)
      },
      // TODO
      onError: (responseError) => {
         console.log('onError', responseError)
      },
      onNonOAuthError: (responseError) => {
         console.log('onNonOAuthError', responseError)
      },
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
               onClick={() => login()}
            >
               {t('btn-connect-google-calendar')}
            </MenuItem>
         </MenuList>
      </Menu>
   )
}

export default Settings
