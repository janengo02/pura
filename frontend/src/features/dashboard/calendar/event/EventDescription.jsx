// =============================================================================
// EVENT DESCRIPTION COMPONENT
// =============================================================================

import React, { useCallback, useMemo } from 'react'
import PropTypes from 'prop-types'
import { HStack, Box } from '@chakra-ui/react'
import { PiTextAlignLeft } from 'react-icons/pi'
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { useReactiveTranslation } from '../../../../hooks/useReactiveTranslation'

const EventDescription = ({ description }) => {
   if (!description) return null
   
   // Check if description contains HTML tags
   const isHTML = /<[^>]*>/g.test(description)
   
   // If it's HTML, check if it contains actual text content
   if (isHTML) {
      // Remove all HTML tags and check if there's meaningful text left
      const textContent = description.replace(/<[^>]*>/g, '').trim()
      // If no text content remains after stripping HTML tags, return null
      if (!textContent) return null
   }

   // Convert plain text line breaks to HTML if needed
   const getDisplayContent = () => {
      if (isHTML) {
         return description
      } else {
         // Convert plain text line breaks to HTML <br> tags
         return description.replace(/\n/g, '<br>')
      }
   }

   return (
      <HStack align='start' spacing={3} w='full'>
         <PiTextAlignLeft size={18} />
         <Box
            fontSize='md'
            color='text.primary'
            flex={1}
            dangerouslySetInnerHTML={{ __html: getDisplayContent() }}
            sx={{
               '& p': { margin: 0, marginBottom: '0.5em' },
               '& ul, & ol': { paddingLeft: '1.5em', marginBottom: '0.5em' },
               '& li': { marginBottom: '0.25em' },
               '& a': { color: 'blue.500', textDecoration: 'underline' },
               '& strong': { fontWeight: 'bold' },
               '& em': { fontStyle: 'italic' },
               '& u': { textDecoration: 'underline' }
            }}
         />
      </HStack>
   )
}

EventDescription.propTypes = {
   description: PropTypes.string
}

const EventDescriptionInput = React.memo(({ description, setDescription }) => {
   const { t } = useReactiveTranslation()
   const handleDescriptionChange = useCallback(
      (content) => {
         // Sanitize content to prevent double encoding and empty content
         const isEmptyContent = content === '<p><br></p>' || content === '<p></p>' || 
                               !content || content.replace(/<[^>]*>/g, '').trim() === ''
         const sanitizedContent = isEmptyContent ? '' : content
         setDescription(sanitizedContent)
      },
      [setDescription]
   )

   // Convert plain text line breaks to HTML for the editor
   const getEditorContent = useCallback(() => {
      if (!description) return ''

      // Check if description contains HTML tags
      const isHTML = /<[^>]*>/g.test(description)

      if (isHTML) {
         return description
      } else {
         // Convert plain text line breaks to HTML <br> tags for the editor
         return description.replace(/\n/g, '<br>')
      }
   }, [description])

   // Quill editor configuration
   const modules = useMemo(
      () => ({
         toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link'],
            ['clean']
         ]
      }),
      []
   )

   const formats = useMemo(
      () => ['header', 'bold', 'italic', 'underline', 'list', 'bullet', 'link'],
      []
   )

   return (
      <HStack align='start' spacing={3} w='full'>
         <PiTextAlignLeft size={18} />
         <Box flex={1} w='full' className='quill-editor-container'>
            <ReactQuill
               value={getEditorContent()}
               onChange={handleDescriptionChange}
               modules={modules}
               formats={formats}
               placeholder={t('placeholder-label-event-description')}
               theme='snow'
            />
         </Box>
      </HStack>
   )
})
EventDescriptionInput.propTypes = {
   description: PropTypes.string.isRequired,
   setDescription: PropTypes.func.isRequired
}

export default EventDescription
export { EventDescriptionInput }
