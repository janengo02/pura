// =============================================================================
// IMPORTS
// =============================================================================

import { extendTheme } from '@chakra-ui/react'

// =============================================================================
// FONT CONFIGURATION
// =============================================================================

// Universal font stack optimized for both English and Japanese
const fonts = {
   heading: `"Noto Sans", "Roboto", "Inter", "Yu Gothic UI", "Hiragino Sans", "Meiryo UI", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
   body: `"Noto Sans", "Roboto", "Inter", "Yu Gothic UI", "Hiragino Sans", "Meiryo UI", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
   mono: `"SF Mono", "Monaco", "Inconsolata", "Roboto Mono", "Source Code Pro", monospace`
}

// =============================================================================
// GLOBAL STYLES
// =============================================================================

const styles = {
   global: {
      // Base font application
      'html, body': {
         fontFamily: fonts.body,
         lineHeight: '1.6',
         letterSpacing: '-0.01em',
         textRendering: 'optimizeLegibility',
         WebkitFontSmoothing: 'antialiased',
         MozOsxFontSmoothing: 'grayscale'
      },

      // Language-specific optimizations
      'html[lang="ja"], html[lang="ja"] body': {
         lineHeight: '1.7',
         letterSpacing: '0.02em',
         wordBreak: 'break-all',
         overflowWrap: 'break-word'
      },

      'html[lang="en"], html[lang="en"] body': {
         lineHeight: '1.6',
         letterSpacing: '-0.01em',
         wordBreak: 'break-word'
      },

      // Force font inheritance on all elements
      '*': {
         fontFamily: 'inherit'
      },

      // Calendar component consistency (from your App.css)
      '.rbc-calendar, .rbc-calendar *': {
         fontFamily: fonts.body + ' !important'
      }
   }
}

// =============================================================================
// COMPONENT OVERRIDES
// =============================================================================

const components = {
   // Text components
   Text: {
      baseStyle: {
         fontFamily: fonts.body
      }
   },

   Heading: {
      baseStyle: {
         fontFamily: fonts.heading,
         fontWeight: '600'
      }
   },

   // Form components
   Button: {
      baseStyle: {
         fontFamily: fonts.body,
         fontWeight: '600'
      }
   },

   Input: {
      baseStyle: {
         field: {
            fontFamily: fonts.body
         }
      }
   },

   Textarea: {
      baseStyle: {
         fontFamily: fonts.body
      }
   },

   Select: {
      baseStyle: {
         field: {
            fontFamily: fonts.body
         }
      }
   },

   // Menu components
   Menu: {
      baseStyle: {
         list: {
            fontFamily: fonts.body
         },
         item: {
            fontFamily: fonts.body
         }
      }
   },

   // Modal components
   Modal: {
      baseStyle: {
         dialog: {
            fontFamily: fonts.body
         }
      }
   },

   // Alert components
   Alert: {
      baseStyle: {
         container: {
            fontFamily: fonts.body
         }
      }
   },

   // Card components
   Card: {
      baseStyle: {
         container: {
            fontFamily: fonts.body
         }
      }
   },

   // Tooltip
   Tooltip: {
      baseStyle: {
         fontFamily: fonts.body,
         fontSize: 'sm'
      }
   },

   // Popover
   Popover: {
      baseStyle: {
         content: {
            fontFamily: fonts.body
         }
      }
   }
}

// =============================================================================
// THEME EXPORT
// =============================================================================

const customTheme = extendTheme({
   fonts,
   styles,
   components
})

export default customTheme
