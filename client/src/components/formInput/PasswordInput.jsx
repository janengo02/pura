import { useState } from "react"
import { InputGroup, InputRightElement, Button, Input } from '@chakra-ui/react'


export const PasswordInput = ({
    register,
    name,
    variant,
    size,
    validation,
}) => {
  const [show, setShow] = useState(false)
  const handleClick = () => setShow(!show)

  return (
    <InputGroup size={size && size}>
      <Input
        variant={variant}
        pr='4.5rem'
        type={show ? 'text' : 'password'}
        placeholder='Enter password'
        {...register(name, validation)}
      />
      <InputRightElement width='4.5rem'>
        <Button h='1.75rem' size='sm' onClick={handleClick}>
          {show ? 'Hide' : 'Show'}
        </Button>
      </InputRightElement>
    </InputGroup>
  )
}
