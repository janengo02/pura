// =============================================================================
// NOVEL-STYLE RICH TEXT EDITOR COMPONENT
// =============================================================================

import React, { useCallback, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Box } from '@chakra-ui/react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const NovelEditor = React.forwardRef(
   ({ value, onChange, onBlur, placeholder, ...props }, ref) => {
      // -------------------------------------------------------------------------
      // CONTENT CONVERSION HELPERS
      // -------------------------------------------------------------------------

      // Convert plain text to HTML for the editor
      const convertPlainTextToHTML = useCallback((text) => {
         if (!text) return '<p></p>'

         // Check if content is already HTML
         const isHTML = /<[^>]*>/g.test(text)

         if (isHTML) {
            return text
         } else {
            // Convert plain text line breaks to HTML paragraphs
            const paragraphs = text.split('\n').filter((p) => p.trim())
            if (paragraphs.length === 0) return '<p></p>'
            return paragraphs.map((p) => `<p>${p}</p>`).join('')
         }
      }, [])

      // -------------------------------------------------------------------------
      // EDITOR SETUP
      // -------------------------------------------------------------------------

      const editor = useEditor({
         extensions: [
            StarterKit.configure({
               bulletList: {
                  keepMarks: true,
                  keepAttributes: false
               },
               orderedList: {
                  keepMarks: true,
                  keepAttributes: false
               }
            })
         ],
         content: convertPlainTextToHTML(value),
         editorProps: {
            attributes: {
               class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none'
            }
         },
         onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            if (onChange) {
               // Create synthetic event to match TextAreaInput interface
               const syntheticEvent = {
                  target: { value: html },
                  preventDefault: () => {}
               }
               onChange(syntheticEvent)
            }
         },
         onBlur: () => {
            if (onBlur && editor) {
               const html = editor.getHTML()
               // Create synthetic event to match TextAreaInput interface
               const syntheticEvent = {
                  target: { value: html },
                  preventDefault: () => {}
               }
               onBlur(syntheticEvent)
            }
         }
      })

      // -------------------------------------------------------------------------
      // EFFECTS
      // -------------------------------------------------------------------------

      // Update editor content when value prop changes
      useEffect(() => {
         if (editor && value !== undefined) {
            const htmlContent = convertPlainTextToHTML(value)
            const currentContent = editor.getHTML()

            // Only update if content has actually changed to avoid cursor issues
            if (htmlContent !== currentContent) {
               editor.commands.setContent(htmlContent, false)
            }
         }
      }, [editor, value, convertPlainTextToHTML])

      // Cleanup editor on unmount
      useEffect(() => {
         return () => {
            if (editor) {
               editor.destroy()
            }
         }
      }, [editor])

      // -------------------------------------------------------------------------
      // RENDER
      // -------------------------------------------------------------------------

      if (!editor) {
         return (
            <Box
               ref={ref}
               w='full'
               className='novel-editor-container'
               minH='100px'
               p={3}
               bg='gray.50'
               borderRadius='md'
               {...props}
            >
               Loading editor...
            </Box>
         )
      }

      return (
         <Box ref={ref} w='full' className='novel-editor-container' {...props}>
            <EditorContent editor={editor} className='novel-editor-content' />
         </Box>
      )
   }
)

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

NovelEditor.displayName = 'NovelEditor'

NovelEditor.propTypes = {
   value: PropTypes.string,
   onChange: PropTypes.func,
   onBlur: PropTypes.func,
   placeholder: PropTypes.string
}

export default NovelEditor
