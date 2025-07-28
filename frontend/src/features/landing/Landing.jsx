// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'

// Redux
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// UI Components
import {
   Box,
   Button,
   Container,
   Flex,
   Heading,
   Text,
   VStack,
   HStack,
   SimpleGrid,
   Card,
   CardBody,
   Icon,
   Badge,
   Divider,
   Image,
   Center
} from '@chakra-ui/react'

// Icons
import {
   PiKanban,
   PiCalendar,
   PiUsers,
   PiGear,
   PiPalette,
   PiGlobe,
   PiShield,
   PiRocket,
   PiCode,
   PiDatabase,
   PiDevices,
   PiLightning,
   PiArrowRight,
   PiCheckCircle,
   PiStar,
   PiPlay,
   PiImage,
   PiVideo
} from 'react-icons/pi'

// Internal Components
import LanguageSwitcher from '../../components/LanguageSwitcher'
import ThemeToggle from '../../components/ThemeToggle'

// Utils
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// =============================================================================
// CONSTANTS
// =============================================================================

const TECH_STACK = [
   {
      category: 'Frontend Technologies',
      technologies: [
         {
            name: 'React 18 + Hooks',
            description: 'Modern functional components with custom hooks',
            icon: PiCode
         },
         {
            name: 'Redux + Thunk',
            description: 'State management with async action handling',
            icon: PiDatabase
         },
         {
            name: 'Chakra UI + Theming',
            description: 'Component library with dark/light theme system',
            icon: PiPalette
         },
         {
            name: 'React Hook Form + Yup',
            description: 'Form handling with schema validation',
            icon: PiCheckCircle
         },
         {
            name: '@hello-pangea/dnd',
            description: 'Drag and drop functionality for Kanban board',
            icon: PiKanban
         },
         {
            name: 'React Big Calendar',
            description: 'Calendar component for task scheduling',
            icon: PiCalendar
         },
         {
            name: 'Internationalization',
            description: 'i18next for English and Japanese support',
            icon: PiGlobe
         }
      ]
   },
   {
      category: 'Backend & APIs',
      technologies: [
         {
            name: 'Node.js + Express',
            description: 'RESTful API server with middleware',
            icon: PiGear
         },
         {
            name: 'MongoDB + Mongoose',
            description: 'NoSQL database with ODM for data modeling',
            icon: PiDatabase
         },
         {
            name: 'JWT Authentication',
            description: 'Token-based auth with bcrypt password hashing',
            icon: PiShield
         },
         {
            name: 'Google Calendar API',
            description: 'OAuth 2.0 integration for calendar sync',
            icon: PiCalendar
         },
         {
            name: 'Google OAuth',
            description: 'Secure authentication with Google accounts',
            icon: PiUsers
         },
         {
            name: 'Protected Routes',
            description: 'React Router v6 with authentication guards',
            icon: PiShield
         }
      ]
   }
]

const FEATURES = [
   {
      title: 'Drag & Drop Kanban Board',
      description:
         'Interactive task management with @hello-pangea/dnd, supporting drag between columns and groups with Redux state management',
      icon: PiKanban,
      color: 'blue'
   },
   {
      title: 'Google Calendar Integration',
      description:
         'OAuth 2.0 authentication with Google Calendar API for viewing, creating, and editing calendar events directly in the app',
      icon: PiCalendar,
      color: 'green'
   },
   {
      title: 'Task & Project Management',
      description:
         'Create tasks, organize into groups, set schedules, and track progress with filtering and search capabilities',
      icon: PiUsers,
      color: 'purple'
   },
   {
      title: 'Multi-language Support',
      description:
         'Internationalization with i18next supporting English and Japanese languages with theme switching',
      icon: PiPalette,
      color: 'orange'
   }
]

const DEMO_FEATURES = [
   {
      id: 'kanban-demo',
      title: 'Interactive Kanban Board',
      subtitle: 'Drag & Drop Task Management',
      description:
         'Built with @hello-pangea/dnd library, the Kanban board allows users to drag tasks between different columns and groups. Tasks can be organized by progress status, with real-time updates to the Redux store and MongoDB backend.',
      features: [
         {
            title: 'Drag & Drop Tasks',
            description:
               'Drag tasks between columns and groups with smooth animations',
            mediaType: 'video',
            mediaSrc: '/assets/videos/kanban-drag-drop.mp4',
            mediaAlt: 'Kanban board drag and drop demonstration'
         },
         {
            title: 'Customizable colors and titles',
            description:
               'Easily customize colors and titles for each column and group',
            mediaType: 'image',
            mediaSrc: '/assets/images/mobile-kanban.png',
            mediaAlt: 'Customizable Kanban board'
         },
         {
            title: 'Task Scheduling',
            description: 'Add multiple schedules and deadlines to each task',
            mediaType: 'image',
            mediaSrc: '/assets/images/task-scheduling.png',
            mediaAlt: 'Task creation modal with scheduling options'
         },
         {
            title: 'Search & Filter',
            description: 'Filter and search tasks across all groups',
            mediaType: 'image',
            mediaSrc: '/assets/images/task-filtering.png',
            mediaAlt: 'Task filtering and search interface'
         }
      ],
      reversed: false
   },
   {
      id: 'calendar-demo',
      title: 'Google Calendar Integration',
      subtitle: 'Calendar Sync & Event Management',
      description:
         'Connect your Google account to sync calendar events with tasks. View your Google Calendar events alongside PURA tasks, create new events, and edit existing ones directly from the application using the Google Calendar API.',
      features: [
         {
            title: 'OAuth Authentication',
            description: 'OAuth 2.0 authentication with Google accounts',
            mediaType: 'image',
            mediaSrc: '/assets/images/google-oauth.png',
            mediaAlt: 'Google OAuth authentication flow'
         },
         {
            title: 'Calendar Views',
            description: 'Split pane interface with month, week, and day views',
            mediaType: 'image',
            mediaSrc: '/assets/images/calendar-views.png',
            mediaAlt: 'Different calendar view options'
         },
         {
            title: 'Multi-Calendar Sync & Direct Editing',
            description:
               'Sync multiple Google calendars and edit Google Calendar events from within PURA',
            mediaType: 'image',
            mediaSrc: '/assets/images/multi-calendar.png',
            mediaAlt: 'Multiple Google calendars synchronized'
         },
         {
            title: 'Conflict Resolution',
            description: 'Handle calendar conflicts and overlapping events',
            mediaType: 'image',
            mediaSrc: '/assets/images/conflict-resolution.png',
            mediaAlt: 'Calendar conflict resolution interface'
         }
      ],
      reversed: true
   },
   {
      id: 'ux-demo',
      title: 'Polished User Experience',
      subtitle: 'Accessibility, Themes & User Feedback',
      description:
         'PURA demonstrates comprehensive UX design with internationalization, theme switching, error handling, and responsive design. Every interaction is crafted to provide smooth, accessible, and user-friendly experience across all devices.',
      features: [
         {
            title: 'Theme System',
            description:
               'Complete dark/light theme system with Chakra UI integration',
            mediaType: 'image',
            mediaSrc: '/assets/images/theme-switching.png',
            mediaAlt: 'Dark and light theme comparison'
         },
         {
            title: 'Internationalization',
            description:
               'English & Japanese language support with reactive translations',
            mediaType: 'image',
            mediaSrc: '/assets/images/language-switching.png',
            mediaAlt: 'Language switching between English and Japanese'
         },
         {
            title: 'Optimistic UI',
            description:
               'Optimistic updates for a seamless user experience with graceful fallbacks',
            mediaType: 'image',
            mediaSrc: '/assets/images/optimistic-ui.png',
            mediaAlt: 'Optimistic UI updates in action'
         },
         {
            title: 'Error Handling & Form Validation',
            description:
               'Comprehensive error handling and form validation with user-friendly messages',
            mediaType: 'image',
            mediaSrc: '/assets/images/error-handling.png',
            mediaAlt: 'Error alerts and validation messages'
         }
      ],
      reversed: false
   }
]

// =============================================================================
// COMPONENT SECTIONS
// =============================================================================

/**
 * Landing page header with navigation
 */
const LandingHeader = React.memo(() => {
   const navigate = useNavigate()
   const { t } = useReactiveTranslation()

   return (
      <Flex
         as='header'
         w='full'
         justifyContent='space-between'
         alignItems='center'
         p={6}
         position='sticky'
         top={0}
         bg='bg.surface'
         borderBottom='1px'
         borderColor='border.default'
         zIndex={10}
      >
         <Heading size='md' color='accent.primary'>
            <Image
               src='/assets/img/pura-logo.png'
               alt='Pura Logo'
               height='40px'
               cursor='pointer'
               onClick={() => navigate('/')}
            />
         </Heading>

         <HStack spacing={4}>
            <ThemeToggle asMenuItem={false} />
            <LanguageSwitcher />
            <Button variant='ghost' onClick={() => navigate('/login')}>
               Log In
            </Button>
            <Button colorScheme='purple' onClick={() => navigate('/register')}>
               Get Started
            </Button>
         </HStack>
      </Flex>
   )
})

LandingHeader.displayName = 'LandingHeader'

/**
 * Hero section with main value proposition
 */
const HeroSection = React.memo(() => {
   const { t } = useReactiveTranslation()
   const navigate = useNavigate()

   return (
      <Container maxW='7xl' py={20}>
         <VStack spacing={8} textAlign='center'>
            <Badge
               colorScheme='purple'
               variant='subtle'
               px={4}
               py={2}
               borderRadius='full'
               fontSize='md'
            >
               💻 Full-Stack Engineering Portfolio
            </Badge>

            <Heading
               size='3xl'
               fontWeight='bold'
               lineHeight='shorter'
               bgGradient='linear(to-r, purple.400, blue.500)'
               bgClip='text'
            >
               PURA Timeboxing Tool
            </Heading>

            <Text
               fontSize='xl'
               color='text.secondary'
               lineHeight='tall'
               maxW='3xl'
            >
               A full-stack task management application built with React,
               Node.js, and MongoDB. Features drag-and-drop Kanban boards,
               Google Calendar integration, and multi-language support to
               demonstrate modern web development skills.
            </Text>

            <HStack spacing={4} pt={4}>
               <Button
                  size='md'
                  colorScheme='purple'
                  rightIcon={<PiArrowRight size={18} />}
                  onClick={() => navigate('/register')}
               >
                  Try the Demo
               </Button>
               <Button
                  size='md'
                  variant='outline'
                  onClick={() =>
                     window.open('https://github.com/janengo02/pura', '_blank')
                  }
               >
                  View Source Code
               </Button>
            </HStack>
         </VStack>
      </Container>
   )
})

HeroSection.displayName = 'HeroSection'

/**
 * Features showcase section
 */
const FeaturesSection = React.memo(() => {
   const { t } = useReactiveTranslation()

   const featureCards = useMemo(
      () =>
         FEATURES.map((feature, index) => (
            <Card
               key={index}
               variant='outline'
               transition='all 0.3s'
               _hover={{
                  transform: 'translateY(-4px)',
                  shadow: 'lg'
               }}
            >
               <CardBody p={8}>
                  <VStack spacing={4} align='center' textAlign='center'>
                     <Icon
                        as={feature.icon}
                        boxSize={12}
                        color={`${feature.color}.500`}
                     />
                     <Heading size='md'>{feature.title}</Heading>
                     <Text color='text.secondary'>{feature.description}</Text>
                  </VStack>
               </CardBody>
            </Card>
         )),
      []
   )

   return (
      <Container maxW='7xl' py={20}>
         <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
               <Heading size='2xl'>Technical Highlights</Heading>
               <Text fontSize='lg' color='text.secondary' maxW='3xl'>
                  Key engineering implementations that demonstrate modern web
                  development expertise and problem-solving capabilities.
               </Text>
            </VStack>

            <SimpleGrid
               columns={{ base: 1, md: 2, lg: 4 }}
               spacing={8}
               w='full'
            >
               {featureCards}
            </SimpleGrid>
         </VStack>
      </Container>
   )
})

/**
 * Demo feature section with interactive media selection
 */
const DemoFeatureSection = React.memo(({ feature, index }) => {
   const [selectedFeature, setSelectedFeature] = useState(0)
   const [isVideoPlaying, setIsVideoPlaying] = useState(false)

   const currentFeature = feature.features[selectedFeature]

   const handleFeatureSelect = useCallback((featureIndex) => {
      setSelectedFeature(featureIndex)
      setIsVideoPlaying(false) // Reset video playing state when switching features
   }, [])

   const handleVideoPlay = useCallback(() => {
      setIsVideoPlaying(true)
   }, [])

   const mediaContent = useMemo(() => {
      if (currentFeature.mediaType === 'video') {
         return (
            <Box
               position='relative'
               borderRadius='xl'
               overflow='hidden'
               shadow='2xl'
            >
               {!isVideoPlaying ? (
                  <Box
                     position='relative'
                     cursor='pointer'
                     onClick={handleVideoPlay}
                     _hover={{ transform: 'scale(1.02)' }}
                     transition='transform 0.3s'
                  >
                     <Image
                        src={`${currentFeature.mediaSrc.replace(
                           '.mp4',
                           '-thumbnail.jpg'
                        )}`}
                        alt={currentFeature.mediaAlt}
                        w='full'
                        h='400px'
                        objectFit='cover'
                        fallbackSrc='https://via.placeholder.com/800x400/805AD5/FFFFFF?text=Video+Demo'
                     />
                     <Center
                        position='absolute'
                        top='50%'
                        left='50%'
                        transform='translate(-50%, -50%)'
                        bg='blackAlpha.700'
                        color='white'
                        borderRadius='full'
                        w={16}
                        h={16}
                        _hover={{ bg: 'blackAlpha.800' }}
                        transition='background 0.2s'
                     >
                        <Icon as={PiPlay} boxSize={8} />
                     </Center>
                  </Box>
               ) : (
                  <Box as='video' w='full' h='400px' controls autoPlay>
                     <source src={currentFeature.mediaSrc} type='video/mp4' />
                     Your browser does not support the video tag.
                  </Box>
               )}
            </Box>
         )
      }

      return (
         <Image
            src={currentFeature.mediaSrc}
            alt={currentFeature.mediaAlt}
            w='full'
            h='400px'
            objectFit='cover'
            borderRadius='xl'
            shadow='2xl'
            _hover={{ transform: 'scale(1.02)' }}
            transition='transform 0.3s'
            fallbackSrc='https://via.placeholder.com/800x400/805AD5/FFFFFF?text=Feature+Demo'
         />
      )
   }, [currentFeature, isVideoPlaying, handleVideoPlay])

   const content = (
      <VStack align='start' spacing={6} flex={1}>
         <Badge colorScheme='purple' variant='subtle' px={3} py={1}>
            <Icon
               as={currentFeature.mediaType === 'video' ? PiVideo : PiImage}
               mr={2}
            />
            {currentFeature.mediaType === 'video'
               ? 'Interactive Demo'
               : 'Feature Preview'}
         </Badge>

         <VStack align='start' spacing={4}>
            <Heading size='xl' color='text.primary'>
               {feature.title}
            </Heading>
            <Text fontSize='lg' color='accent.primary' fontWeight='semibold'>
               {feature.subtitle}
            </Text>
            <Text fontSize='md' color='text.secondary' lineHeight='tall'>
               {feature.description}
            </Text>
         </VStack>

         <VStack align='start' spacing={4} w='full'>
            <Text fontSize='md' fontWeight='semibold' color='text.primary'>
               Explore Features:
            </Text>
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={3} w='full'>
               {feature.features.map((item, idx) => (
                  <Button
                     key={idx}
                     variant={selectedFeature === idx ? 'solid' : 'outline'}
                     colorScheme={selectedFeature === idx ? 'purple' : 'gray'}
                     size='md'
                     onClick={() => handleFeatureSelect(idx)}
                     leftIcon={
                        <Icon
                           as={PiCheckCircle}
                           color={
                              selectedFeature === idx ? 'white' : 'green.500'
                           }
                        />
                     }
                     justifyContent='flex-start'
                     textAlign='left'
                     h='auto'
                     py={3}
                     px={4}
                     whiteSpace='normal'
                     fontWeight='normal'
                  >
                     <VStack align='start' spacing={1}>
                        <Text fontSize='xs' fontWeight='bold'>
                           {item.title}
                        </Text>
                        <Text fontSize='xs' opacity={0.8}>
                           {item.description}
                        </Text>
                     </VStack>
                  </Button>
               ))}
            </SimpleGrid>
         </VStack>
      </VStack>
   )

   return (
      <Container maxW='7xl' py={20}>
         <SimpleGrid
            columns={{ base: 1, lg: 2 }}
            spacing={12}
            alignItems='center'
         >
            {feature.reversed ? (
               <>
                  <Box order={{ base: 2, lg: 1 }}>{mediaContent}</Box>
                  <Box order={{ base: 1, lg: 2 }}>{content}</Box>
               </>
            ) : (
               <>
                  <Box>{content}</Box>
                  <Box>{mediaContent}</Box>
               </>
            )}
         </SimpleGrid>
      </Container>
   )
})

DemoFeatureSection.displayName = 'DemoFeatureSection'

DemoFeatureSection.propTypes = {
   feature: PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      subtitle: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      features: PropTypes.arrayOf(
         PropTypes.shape({
            title: PropTypes.string.isRequired,
            description: PropTypes.string.isRequired,
            mediaType: PropTypes.oneOf(['image', 'video']).isRequired,
            mediaSrc: PropTypes.string.isRequired,
            mediaAlt: PropTypes.string.isRequired
         })
      ).isRequired,
      reversed: PropTypes.bool.isRequired
   }).isRequired,
   index: PropTypes.number.isRequired
}

/**
 * All demo features showcase
 */
const DemoFeaturesShowcase = React.memo(() => {
   const { t } = useReactiveTranslation()

   return (
      <Box>
         {DEMO_FEATURES.map((feature, index) => (
            <Box key={feature.id}>
               <DemoFeatureSection feature={feature} index={index} />
               {index < DEMO_FEATURES.length - 1 && (
                  <Box bg='bg.canvas' py={1}>
                     <Container maxW='7xl'>
                        <Divider opacity={0.3} />
                     </Container>
                  </Box>
               )}
            </Box>
         ))}
      </Box>
   )
})

DemoFeaturesShowcase.displayName = 'DemoFeaturesShowcase'

/**
 * Technology stack section
 */
const TechStackSection = React.memo(() => {
   const { t } = useReactiveTranslation()

   const techCategories = useMemo(
      () =>
         TECH_STACK.map((category, categoryIndex) => (
            <Box key={categoryIndex}>
               <Heading size='md' mb={6} color='accent.primary'>
                  {category.category}
               </Heading>
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {category.technologies.map((tech, techIndex) => (
                     <Card
                        key={techIndex}
                        variant='filled'
                        size='md'
                        transition='all 0.2s'
                        _hover={{ bg: 'accent.subtle' }}
                     >
                        <CardBody>
                           <HStack spacing={3}>
                              <Icon
                                 as={tech.icon}
                                 boxSize={6}
                                 color='accent.primary'
                              />
                              <Box>
                                 <Text fontWeight='bold'>{tech.name}</Text>
                                 <Text fontSize='md' color='text.muted'>
                                    {tech.description}
                                 </Text>
                              </Box>
                           </HStack>
                        </CardBody>
                     </Card>
                  ))}
               </SimpleGrid>
            </Box>
         )),
      []
   )

   return (
      <Box bg='bg.canvas' py={20}>
         <Container maxW='7xl'>
            <VStack spacing={12}>
               <VStack spacing={4} textAlign='center'>
                  <Badge colorScheme='purple' variant='subtle' px={3} py={1}>
                     <Icon as={PiLightning} mr={2} />
                     Technical Implementation
                  </Badge>
                  <Heading size='2xl'>Engineering & Architecture</Heading>
                  <Text fontSize='lg' color='text.secondary' maxW='3xl'>
                     This project demonstrates modern full-stack development
                     practices, clean architecture patterns, and scalable code
                     organization. Each technology choice was made to showcase
                     specific engineering skills.
                  </Text>
               </VStack>

               <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} w='full'>
                  {techCategories}
               </SimpleGrid>
            </VStack>
         </Container>
      </Box>
   )
})

TechStackSection.displayName = 'TechStackSection'

/**
 * Call-to-action section
 */
const CTASection = React.memo(() => {
   const { t } = useReactiveTranslation()
   const navigate = useNavigate()

   return (
      <Container maxW='7xl' py={20}>
         <Card variant='filled' bg='accent.primary' color='white'>
            <CardBody p={12}>
               <VStack spacing={8} textAlign='center'>
                  <Icon as={PiCode} boxSize={16} color='yellow.400' />
                  <Heading size='xl' color='white'>
                     Ready to Explore?
                  </Heading>
                  <Text fontSize='lg' opacity={0.9} maxW='2xl'>
                     This project showcases full-stack development skills with
                     modern technologies. Feel free to explore the application,
                     examine the code, or reach out to discuss the
                     implementation.
                  </Text>
                  <HStack spacing={4}>
                     <Button
                        size='md'
                        bg='white'
                        color='purple.600'
                        _hover={{ bg: 'gray.100' }}
                        rightIcon={<PiArrowRight size={18} />}
                        onClick={() => navigate('/register')}
                     >
                        Try the Demo
                     </Button>
                     <Button
                        size='md'
                        variant='outline'
                        color='white'
                        borderColor='white'
                        _hover={{ bg: 'whiteAlpha.200' }}
                        onClick={() =>
                           window.open(
                              'https://github.com/janengo02/pura',
                              '_blank'
                           )
                        }
                     >
                        View Source
                     </Button>
                  </HStack>
               </VStack>
            </CardBody>
         </Card>
      </Container>
   )
})

CTASection.displayName = 'CTASection'

/**
 * Footer section
 */
const Footer = React.memo(() => {
   const { t } = useReactiveTranslation()

   return (
      <Box
         as='footer'
         bg='bg.canvas'
         py={12}
         borderTop='1px'
         borderColor='border.default'
      >
         <Container maxW='7xl'>
            <VStack spacing={8}>
               <Flex
                  w='full'
                  justifyContent='space-between'
                  alignItems='center'
                  flexDirection={{ base: 'column', md: 'row' }}
                  gap={4}
               >
                  <HStack spacing={2}>
                     <Heading size='md' color='accent.primary'>
                        PURA
                     </Heading>
                     <Badge variant='outline'>v1.0</Badge>
                  </HStack>

                  <Text color='text.muted' fontSize='md'>
                     {t('footer-copyright')}
                  </Text>
               </Flex>
            </VStack>
         </Container>
      </Box>
   )
})

Footer.displayName = 'Footer'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const Landing = React.memo(() => {
   // -------------------------------------------------------------------------
   // HOOKS & STATE
   // -------------------------------------------------------------------------
   const [isScrolled, setIsScrolled] = useState(false)

   // -------------------------------------------------------------------------
   // EFFECTS
   // -------------------------------------------------------------------------
   useEffect(() => {
      const handleScroll = () => {
         setIsScrolled(window.scrollY > 50)
      }

      window.addEventListener('scroll', handleScroll)
      return () => window.removeEventListener('scroll', handleScroll)
   }, [])

   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------
   return (
      <Box minH='100vh' bg='bg.surface'>
         <LandingHeader />
         <HeroSection />
         <FeaturesSection />
         <DemoFeaturesShowcase />
         <TechStackSection />
         <CTASection />
         <Footer />
      </Box>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

// Display name for debugging
Landing.displayName = 'Landing'

// PropTypes validation
Landing.propTypes = {
   // Add props if needed for Redux connection
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectLandingData = createSelector(
   [
      // Add selectors if needed
      (state) => state.language.language,
      (state) => state.theme.theme
   ],
   (language, theme) => ({
      language,
      theme
   })
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   landingData: selectLandingData(state)
})

const mapDispatchToProps = {
   // Add action creators if needed
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Landing)
