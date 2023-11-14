import { Input } from '@chakra-ui/react'


export const TextInput = ({
    register,
    name,
    variant,
    type,
    placeholder,
    size,
    validation,
}) => {
  return (
    <Input
        variant={variant}
        type={type}
        placeholder={placeholder}
        size={size && size}
        {...register(name, validation)}
    />
  )
}
