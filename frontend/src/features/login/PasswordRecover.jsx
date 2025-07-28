import React from 'react'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

const PasswordRecover = () => {
   const { t } = useReactiveTranslation()
   return <div>{t('password-recover')}</div>
}

export default PasswordRecover
