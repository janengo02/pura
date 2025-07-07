import { useState } from 'react'
import { InputGroup, InputRightElement, Button, Input } from '@chakra-ui/react'
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

export const PasswordInput = ({
   register,
   name,
   variant,
   size,
   validation,
   ...props
}) => {
   const { t } = useReactiveTranslation()
   const [show, setShow] = useState(false)
   const handleClick = () => setShow(!show)
   return (
      <InputGroup size={size && size}>
         <Input
            variant={variant}
            pr='4.5rem'
            type={show ? 'text' : 'password'}
            placeholder={t('placeholder-password')}
            {...register(name, validation)}
            {...props}
         />
         <InputRightElement width='4.5rem'>
            <Button h='1.75rem' size='sm' onClick={handleClick}>
               {show ? t('btn-hide') : t('btn-show')}
            </Button>
         </InputRightElement>
      </InputGroup>
   )
}
