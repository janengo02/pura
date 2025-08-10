import React, { useCallback } from 'react'
import { HStack, Square, Text, Textarea } from '@chakra-ui/react'
import PropTypes from 'prop-types'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventWrapperTitle = ({ text, color, ...props }) => {
   return (
      <HStack spacing={3} align='top'>
         <Square bg={color} size='16px' borderRadius={4} mt={2} />
         <Text fontSize='xl' fontWeight={600} {...props}>
            {text}
         </Text>
      </HStack>
   )
}

const EventTitleInput = React.memo(({ title, setTitle }) => {
   const { t } = useReactiveTranslation()
   const handleTitleChange = useCallback(
      (e) => {
         setTitle(e.target.value)
      },
      [setTitle]
   )

   return (
      <Textarea
         value={title}
         onChange={handleTitleChange}
         onBlur={handleTitleChange}
         fontSize='2xl'
         fontWeight='semibold'
         flexGrow={1}
         variant='flushed'
         resize='none'
         rows={1}
         placeholder={t('placeholder-event-title')}
      />
   )
})
EventWrapperTitle.propTypes = {
   text: PropTypes.string.isRequired,
   color: PropTypes.string.isRequired
}
EventTitleInput.propTypes = {
   title: PropTypes.string.isRequired,
   setTitle: PropTypes.func.isRequired
}

export default EventWrapperTitle
export { EventTitleInput }
