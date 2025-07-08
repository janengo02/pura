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
// COLOR CONFIGURATION
// =============================================================================

const colors = {
   // Custom brand colors that work well in both themes
   brand: {
      50: '#f7fafc',
      100: '#edf2f7',
      200: '#e2e8f0',
      300: '#cbd5e0',
      400: '#a0aec0',
      500: '#718096',
      600: '#4a5568',
      700: '#2d3748',
      800: '#1a202c',
      900: '#171923'
   }
}

// =============================================================================
// SEMANTIC TOKENS FOR THEME SWITCHING
// =============================================================================

const semanticTokens = {
   colors: {
      // Background colors
      'bg.canvas': {
         default: 'gray.50',
         _dark: 'gray.900'
      },
      'bg.surface': {
         default: 'white',
         _dark: 'gray.800'
      },
      'bg.overlay': {
         default: 'white',
         _dark: 'gray.700'
      },

      // Text colors
      'text.primary': {
         default: 'gray.600',
         _dark: 'gray.200'
      },
      'text.secondary': {
         default: 'gray.500',
         _dark: 'gray.400'
      },
      'text.muted': {
         default: 'gray.400',
         _dark: 'gray.400'
      },

      // Accent colors
      'accent.primary': {
         default: 'purple.600',
         _dark: 'purple.200'
      },
      'accent.secondary': {
         default: 'purple.500',
         _dark: 'purple.300'
      },
      'accent.subtle': {
         default: 'purple.50',
         _dark: 'purple.700'
      },

      // Danger colors
      'danger.primary': {
         default: 'red.400',
         _dark: 'red.300'
      },
      'danger.secondary': {
         default: 'red.500',
         _dark: 'red.400'
      },

      // Border colors
      'border.default': {
         default: 'gray.200',
         _dark: 'gray.600'
      },
      'border.muted': {
         default: 'gray.100',
         _dark: 'gray.700'
      },
      // Divider colors
      'divider.default': {
         default: 'gray.100',
         _dark: 'gray.700'
      },
      'divider.focus': {
         default: 'purple.600',
         _dark: 'purple.200'
      },
      // Kanban colors
      'kanban.group.default': {
         default: 'gray.600', // Gray
         _dark: 'gray.200' // Light gray
      },
      'kanban.group.orange': {
         default: '#e7905e', // Orange
         _dark: '#e6a580' // Light orange
      },
      'kanban.group.green': {
         default: '#3E9C75', // Green
         _dark: '#4f9f7e' // Light green
      },
      'kanban.group.red': {
         default: '#ed6363', // Red
         _dark: '#df7476' // Light red
      },
      'kanban.group.blue': {
         default: '#63b3ed', // Blue
         _dark: '#8accfc' // Light blue
      },
      'kanban.group.purple': {
         default: '#805ad5', // Purple
         _dark: '#927cc3' // Light purple
      },
      'kanban.progress.default': {
         default: '#EDF2F7', // Light gray
         _dark: 'gray.700' // Gray
      },
      'kanban.progress.orange': {
         default: '#FFF0E4', // Light orange
         _dark: '#845f48' // Orange
      },
      'kanban.progress.green': {
         default: '#CDF4E4', // Light green
         _dark: '#223335' // Green
      },
      'kanban.progress.red': {
         default: '#FFE5E5', // Light red
         _dark: '#47222a' // Red
      },
      'kanban.progress.blue': {
         default: '#DAF2FF', // Light blue
         _dark: '#1a3054' // Blue
      },
      'kanban.progress.purple': {
         default: '#FAF5FF', // Light purple
         _dark: '#352a4e' // Purple
      },
      'kanban.progress.title.default': {
         default: '#4A5568', // Gray
         _dark: '#EDF2F7' // Light gray
      },
      'kanban.progress.title.orange': {
         default: '#E95F11', // Orange
         _dark: '#f6d3b9' // Light orange
      },
      'kanban.progress.title.green': {
         default: '#3E9C75', // Green
         _dark: '#a1bcc0' // Light green
      },
      'kanban.progress.title.red': {
         default: '#DD3E3E', // Red
         _dark: '#e9b7c0' // Light red
      },
      'kanban.progress.title.blue': {
         default: '#3E80CF', // Blue
         _dark: '#b1cddb' // Light blue
      },
      'kanban.progress.title.purple': {
         default: '#805AD5', // Purple
         _dark: '#d4c4e3' // Light purple
      },
      // Kanban progress card colors
      'kanban.progress.default.card': {
         default: 'white', // Light gray
         _dark: 'gray.800' // Gray
      },
      'kanban.progress.orange.card': {
         default: 'white', // Light orange
         _dark: '#5f4231' // Orange
      },
      'kanban.progress.green.card': {
         default: 'white', // Light green
         _dark: '#182b2d' // Green
      },
      'kanban.progress.red.card': {
         default: 'white', // Light red
         _dark: '#3b1b22' // Red
      },
      'kanban.progress.blue.card': {
         default: 'white', // Light blue
         _dark: '#122442' // Blue
      },
      'kanban.progress.purple.card': {
         default: 'white', // Light purple
         _dark: '#29213c' // Purple
      },
      'kanban.progress.default.card.hover': {
         default: 'gray.50', // Light gray
         _dark: 'gray.900' // Gray
      },
      'kanban.progress.orange.card.hover': {
         default: 'gray.50', // Light orange
         _dark: '#533829' // Orange
      },
      'kanban.progress.green.card.hover': {
         default: 'gray.50', // Light green
         _dark: '#102021' // Green
      },
      'kanban.progress.red.card.hover': {
         default: 'gray.50', // Light red
         _dark: '#30141a' // Red
      },
      'kanban.progress.blue.card.hover': {
         default: 'gray.50', // Light blue
         _dark: '#11223e' // Blue
      },
      'kanban.progress.purple.card.hover': {
         default: 'gray.50', // Light purple
         _dark: '#211b31' // Purple
      }
   }
}

// =============================================================================
// GLOBAL STYLES
// =============================================================================

const styles = {
   global: (props) => ({
      // Base font application
      'html, body': {
         fontFamily: fonts.body,
         lineHeight: '1.5',
         letterSpacing: '-0.01em',
         textRendering: 'optimizeLegibility',
         WebkitFontSmoothing: 'antialiased',
         MozOsxFontSmoothing: 'grayscale',
         bg: props.colorMode === 'dark' ? 'gray.800' : 'white',
         color: props.colorMode === 'dark' ? 'gray.100' : 'gray.600'
      },

      // Language-specific optimizations
      'html[lang="ja"], html[lang="ja"] body': {
         lineHeight: '1.6',
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

      // Calendar component consistency
      '.rbc-calendar, .rbc-calendar *': {
         fontFamily: fonts.body + ' !important'
      },

      // Scrollbar styling for dark mode
      '::-webkit-scrollbar': {
         width: '8px'
      },
      '::-webkit-scrollbar-track': {
         bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100'
      },
      '::-webkit-scrollbar-thumb': {
         bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.400',
         borderRadius: '4px'
      },
      '::-webkit-scrollbar-thumb:hover': {
         bg: props.colorMode === 'dark' ? 'gray.500' : 'gray.500'
      }
   })
}

// =============================================================================
// COMPONENT OVERRIDES
// =============================================================================

const components = {
   // Text components
   Text: {
      baseStyle: {
         fontFamily: fonts.body,
         color: 'text.primary'
      }
   },

   Heading: {
      baseStyle: {
         fontFamily: fonts.heading,
         fontWeight: '600',
         color: 'text.primary'
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
            fontFamily: fonts.body,
            bg: 'bg.overlay',
            borderColor: 'border.default'
         },
         item: {
            fontFamily: fonts.body,
            color: 'text.primary',
            _hover: {
               bg: 'bg.surface'
            }
         }
      }
   },

   // Modal components
   Modal: {
      baseStyle: {
         dialog: {
            fontFamily: fonts.body,
            bg: 'bg.canvas'
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
            fontFamily: fonts.body,
            bg: 'bg.surface',
            borderColor: 'border.default'
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
            fontFamily: fonts.body,
            bg: 'bg.overlay',
            borderColor: 'border.default'
         }
      }
   }
}

// =============================================================================
// CONFIG
// =============================================================================

const config = {
   initialColorMode: 'light',
   useSystemColorMode: false
}

// =============================================================================
// THEME EXPORT
// =============================================================================

const customTheme = extendTheme({
   config,
   fonts,
   colors,
   semanticTokens,
   styles,
   components
})

export default customTheme
