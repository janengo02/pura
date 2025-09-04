import React from 'react'
import { useReactiveTranslation } from '../../../shared/hooks/useReactiveTranslation'

const PasswordRecover = () => {
   const { t } = useReactiveTranslation()
   return <div>{t('title-password-recover')}</div>
}

export default PasswordRecover
