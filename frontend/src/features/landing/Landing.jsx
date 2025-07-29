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
   PiCode,
   PiDatabase,
   PiLightning,
   PiArrowRight,
   PiCheckCircle,
   PiPlay,
   PiImage,
   PiClock,
   PiTarget
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
      category: 'Frontend Implementation',
      technologies: [
         {
            name: 'React 18 + Hooks',
            description: 'Functional components with custom hooks architecture',
            icon: PiCode
         },
         {
            name: 'Redux',
            description: 'Centralized state management with optimistic updates',
            icon: PiDatabase
         },
         {
            name: 'Chakra UI + Theming',
            description: 'Component library with custom theme system',
            icon: PiPalette
         },
         {
            name: 'React Hook Form + Yup',
            description: 'Form validation with schema-based validation',
            icon: PiCheckCircle
         },
         {
            name: 'Modern libraries',
            description:
               'Utilizing the power of hello-pangea/dnd and react-big-calendar',
            icon: PiKanban
         },
         {
            name: 'i18next Integration',
            description: 'Internationalization with reactive translations',
            icon: PiGlobe
         }
      ]
   },
   {
      category: 'Backend Architecture',
      technologies: [
         {
            name: 'Node.js + Express',
            description: 'RESTful API with middleware architecture',
            icon: PiGear
         },
         {
            name: 'MongoDB + Mongoose',
            description: 'Document database with ODM integration',
            icon: PiDatabase
         },
         {
            name: 'JWT Authentication',
            description: 'Token-based auth with refresh token rotation',
            icon: PiShield
         },
         {
            name: 'Google APIs',
            description: 'Google Calendar, Meet and Map API integration',
            icon: PiCalendar
         },
         {
            name: 'Google OAuth 2.0',
            description: 'Secure authentication flow implementation',
            icon: PiUsers
         },
         {
            name: 'Protected Routes',
            description: 'Route-level authentication guards',
            icon: PiShield
         }
      ]
   }
]

const FEATURES = [
   {
      title: 'Interactive Kanban Board',
      description:
         'Drag-and-drop task management with real-time state synchronization. Features custom drag previews, drop zones, and smooth animations.',
      icon: PiKanban,
      color: 'blue'
   },
   {
      title: 'Google Calendar Sync',
      description:
         'Bidirectional calendar integration with OAuth 2.0 authentication. View, create, and edit Google Calendar events within the application.',
      icon: PiCalendar,
      color: 'green'
   },
   {
      title: 'Task Management System',
      description:
         'Comprehensive task organization with groups, scheduling, and progress tracking. Includes search and filtering capabilities.',
      icon: PiClock,
      color: 'purple'
   },
   {
      title: 'Internationalization',
      description:
         'Full i18n support with English and Japanese locales. Theme switching with persistent user preferences.',
      icon: PiGlobe,
      color: 'orange'
   }
]

const DEMO_FEATURES = [
   {
      id: 'kanban-demo',
      title: 'Kanban Board Implementation',
      subtitle: 'Drag & Drop Task Management',
      description:
         'Tasks can be moved between columns and groups with real-time Redux state updates and MongoDB persistence. The implementation includes custom drag previews, drop animations, and optimistic UI updates.',
      features: [
         {
            title: 'Drag & Drop Interface',
            description:
               'Smooth drag interactions with visual feedback and accessibility support',
            mediaType: 'video',
            mediaSrc: '/assets/videos/kanban-drag-drop.mp4',
            mediaAlt: 'Kanban board drag and drop functionality demonstration'
         },
         {
            title: 'Customizable Layouts',
            description:
               'Dynamic column and group creation with color customization',
            mediaType: 'image',
            mediaSrc: '/assets/images/mobile-kanban.png',
            mediaAlt: 'Customizable Kanban board layout options'
         },
         {
            title: 'Task Scheduling',
            description:
               'Multiple schedules per task are supported for flexible timeboxing',
            mediaType: 'image',
            mediaSrc: '/assets/images/task-scheduling.png',
            mediaAlt: 'Task creation modal with scheduling interface'
         },
         {
            title: 'Advanced Filtering',
            description:
               'Real-time search and filter functionality across tasks',
            mediaType: 'image',
            mediaSrc: '/assets/images/task-filtering.png',
            mediaAlt: 'Task filtering and search interface'
         }
      ],
      reversed: false
   },
   {
      id: 'calendar-demo',
      title: 'Calendar Integration',
      subtitle: 'Google Calendar API Implementation',
      description:
         'OAuth 2.0 integration with Google Calendar API enables seamless calendar synchronization. The implementation supports multiple Google calendars, event creation/editing, and conflict detection. Calendar data is cached locally with background sync for optimal performance.',
      features: [
         {
            title: 'OAuth Authentication',
            description:
               'Secure Google OAuth 2.0 implementation with token management',
            mediaType: 'image',
            mediaSrc: '/assets/images/google-oauth.png',
            mediaAlt: 'Google OAuth authentication flow'
         },
         {
            title: 'Multiple View Modes',
            description: 'Month, week, and day views with responsive design',
            mediaType: 'image',
            mediaSrc: '/assets/images/calendar-views.png',
            mediaAlt: 'Calendar application with multiple view options'
         },
         {
            title: 'Event Management',
            description:
               'Create, edit, and delete Google Calendar events directly',
            mediaType: 'image',
            mediaSrc: '/assets/images/multi-calendar.png',
            mediaAlt: 'Google Calendar event management interface'
         },
         {
            title: 'Conflict Detection',
            description:
               'Automatic detection and handling of scheduling conflicts',
            mediaType: 'image',
            mediaSrc: '/assets/images/conflict-resolution.png',
            mediaAlt: 'Calendar conflict detection and resolution system'
         }
      ],
      reversed: true
   },
   {
      id: 'ux-demo',
      title: 'User Experience Design',
      subtitle: 'Accessibility & Internationalization',
      description:
         'The application implements comprehensive UX patterns including theme switching, internationalization, error handling, and responsive design. All interactions include proper loading states, error boundaries, and accessibility features for screen readers.',
      features: [
         {
            title: 'Theme System',
            description:
               'Dynamic theme switching with Chakra UI integration and persistence',
            mediaType: 'image',
            mediaSrc: '/assets/images/theme-switching.png',
            mediaAlt: 'Dark and light theme switching demonstration'
         },
         {
            title: 'Internationalization',
            description:
               'React i18next implementation with English and Japanese support',
            mediaType: 'image',
            mediaSrc: '/assets/images/language-switching.png',
            mediaAlt:
               'Language switching interface between English and Japanese'
         },
         {
            title: 'Optimistic Updates',
            description:
               'Immediate UI feedback with graceful error handling and rollback',
            mediaType: 'image',
            mediaSrc: '/assets/images/optimistic-ui.png',
            mediaAlt: 'Optimistic UI updates with error handling'
         },
         {
            title: 'Form Validation',
            description:
               'Real-time validation with React Hook Form and Yup schemas',
            mediaType: 'image',
            mediaSrc: '/assets/images/error-handling.png',
            mediaAlt: 'Form validation and error handling interface'
         }
      ],
      reversed: false
   }
]

const HASHTAGS = [
   { text: 'ReactJS', colorScheme: 'blue' },
   { text: 'Redux', colorScheme: 'purple' },
   { text: 'NodeJS', colorScheme: 'teal' },
   { text: 'ExpressJS', colorScheme: 'yellow' },
   { text: 'MongoDB', colorScheme: 'green' },
   { text: 'Yup', colorScheme: 'gray' },
   { text: 'ChakraUI', colorScheme: 'cyan' },
   { text: 'Google APIs', colorScheme: 'red' },
   { text: 'i18next', colorScheme: 'pink' },
   { text: 'JWT Authentication', colorScheme: 'orange' }
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
         bg='bg.canvas'
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
               Demo Login
            </Button>
            <Button colorScheme='purple' onClick={() => navigate('/register')}>
               View Demo
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
               📋 Task Management Application
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
               A full-stack task management application featuring Kanban boards
               with drag-and-drop functionality, Google Calendar integration,
               and comprehensive internationalization. Built with React,
               Node.js, and MongoDB.
            </Text>

            <HStack spacing={4} wrap='wrap' justifyContent='center' maxW='3xl'>
               {HASHTAGS.map((tag, index) => (
                  <Badge
                     key={index}
                     colorScheme={tag.colorScheme}
                     variant='outline'
                     px={4}
                     py={2}
                     borderRadius='full'
                     fontSize='sm'
                  >
                     {tag.text}
                  </Badge>
               ))}
            </HStack>
            <HStack spacing={4} pt={4}>
               <Button
                  size='lg'
                  colorScheme='purple'
                  rightIcon={<PiArrowRight size={20} />}
                  onClick={() => navigate('/register')}
               >
                  Explore Application
               </Button>
               <Button
                  size='lg'
                  variant='outline'
                  leftIcon={<PiCode size={20} />}
                  onClick={() =>
                     window.open('https://github.com/janengo02/pura', '_blank')
                  }
               >
                  View Source Code
               </Button>
            </HStack>

            <Text fontSize='sm' color='text.secondary' mt={4}>
               Interactive demo available • Full source code on GitHub
            </Text>
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
               borderRadius={6}
               _hover={{
                  transform: 'translateY(-4px)',
                  shadow: '2xl',
                  borderColor: `${feature.color}.200`
               }}
            >
               <CardBody p={8}>
                  <VStack spacing={6} align='center' textAlign='center'>
                     <Flex
                        boxSize={16}
                        borderRadius='full'
                        justifyContent='center'
                        alignItems='center'
                        bg={`${feature.color}.100`}
                        color={`${feature.color}.500`}
                     >
                        <Icon as={feature.icon} boxSize={8} />
                     </Flex>
                     <Heading size='md' color='text.primary'>
                        {feature.title}
                     </Heading>
                     <Text color='text.secondary' lineHeight='tall'>
                        {feature.description}
                     </Text>
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
               <Badge
                  colorScheme='blue'
                  variant='subtle'
                  px={3}
                  py={1}
                  borderRadius={4}
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
               >
                  <Icon as={PiTarget} mr={2} />
                  Key Features
               </Badge>
               <Heading size='2xl'>Application Overview</Heading>
               <Text fontSize='lg' color='text.secondary' maxW='3xl'>
                  Core functionality implemented in this application experience
                  design.
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

FeaturesSection.displayName = 'FeaturesSection'

/**
 * Demo feature section with interactive media selection
 */
const DemoFeatureSection = React.memo(({ feature, index }) => {
   const [selectedFeature, setSelectedFeature] = useState(0)
   const [isVideoPlaying, setIsVideoPlaying] = useState(false)

   const currentFeature = feature.features[selectedFeature]

   const handleFeatureSelect = useCallback((featureIndex) => {
      setSelectedFeature(featureIndex)
      setIsVideoPlaying(false)
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
                        fallbackSrc='https://via.placeholder.com/800x400/805AD5/FFFFFF?text=Feature+Demo'
                     />
                     <Center
                        position='absolute'
                        top='50%'
                        left='50%'
                        transform='translate(-50%, -50%)'
                        bg='blackAlpha.700'
                        color='white'
                        borderRadius='full'
                        w={20}
                        h={20}
                        _hover={{
                           bg: 'blackAlpha.800',
                           transform: 'translate(-50%, -50%) scale(1.1)'
                        }}
                        transition='all 0.2s'
                     >
                        <Icon as={PiPlay} boxSize={10} />
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
            fallbackSrc='https://via.placeholder.com/800x400/805AD5/FFFFFF?text=Feature+Preview'
         />
      )
   }, [currentFeature, isVideoPlaying, handleVideoPlay])

   const content = (
      <VStack align='start' spacing={6} flex={1}>
         <Badge
            colorScheme='purple'
            variant='subtle'
            px={3}
            py={1}
            borderRadius={4}
            display='flex'
            alignItems='center'
            justifyContent='center'
         >
            <Icon as={PiImage} mr={2} />
            Implementation Preview
         </Badge>

         <VStack align='start' spacing={4}>
            <Heading size='xl' color='text.primary'>
               {feature.title}
            </Heading>
            <Text fontSize='lg' color='accent.primary' fontWeight='semibold'>
               {feature.subtitle}
            </Text>
            <Text fontSize='md' color='text.primary' lineHeight='tall'>
               {feature.description}
            </Text>
         </VStack>

         <VStack align='start' spacing={4} w='full'>
            <Text fontSize='md' fontWeight='semibold' color='text.primary'>
               Implementation Details:
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
                              selectedFeature === idx
                                 ? 'accent.subtle'
                                 : 'success.secondary'
                           }
                        />
                     }
                     justifyContent='flex-start'
                     textAlign='left'
                     h='auto'
                     py={4}
                     px={4}
                     whiteSpace='normal'
                     fontWeight='normal'
                  >
                     <VStack align='start' spacing={1}>
                        <Text
                           fontWeight='bold'
                           color={
                              selectedFeature === idx
                                 ? 'text.highlight'
                                 : 'text.primary'
                           }
                        >
                           {item.title}
                        </Text>
                        <Text
                           fontSize='sm'
                           opacity={0.8}
                           color={
                              selectedFeature === idx
                                 ? 'text.highlight'
                                 : 'text.primary'
                           }
                        >
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
      <Container
         maxW='7xl'
         py={20}
         id={index === 0 ? 'demo-section' : undefined}
      >
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
      <Box bg='bg.canvas'>
         {DEMO_FEATURES.map((feature, index) => (
            <Box key={feature.id}>
               <DemoFeatureSection feature={feature} index={index} />
               {index < DEMO_FEATURES.length - 1 && (
                  <Box py={1}>
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
                        _hover={{
                           bg: 'accent.subtle',
                           transform: 'translateY(-2px)'
                        }}
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
                                 <Text fontSize='sm' color='text.secondary'>
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
      <Container maxW='7xl' py={20}>
         <VStack spacing={12}>
            <VStack spacing={4} textAlign='center'>
               <Badge
                  colorScheme='green'
                  variant='subtle'
                  px={3}
                  py={1}
                  borderRadius={4}
                  display='flex'
                  alignItems='center'
                  justifyContent='center'
               >
                  <Icon as={PiLightning} mr={2} />
                  Technical Implementation
               </Badge>
               <Heading size='2xl'>Technology Stack</Heading>
               <Text fontSize='lg' color='text.secondary' maxW='3xl'>
                  Modern web development stack with focus on performance,
                  scalability, and maintainable code architecture.
               </Text>
            </VStack>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={12} w='full'>
               {techCategories}
            </SimpleGrid>
         </VStack>
      </Container>
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
         <Card
            variant='elevated'
            bg='purple.700'
            color='white'
            overflow='hidden'
            position='relative'
         >
            <Box
               position='absolute'
               top='-50%'
               right='-20%'
               w='400px'
               h='400px'
               borderRadius='full'
               bg='whiteAlpha.100'
            />
            <Box
               position='absolute'
               bottom='-30%'
               left='-10%'
               w='300px'
               h='300px'
               borderRadius='full'
               bg='whiteAlpha.50'
            />
            <CardBody p={12} position='relative'>
               <VStack spacing={8} textAlign='center'>
                  <Icon as={PiCode} boxSize={16} color='yellow.300' />
                  <Heading size='xl' color='white'>
                     Explore the Application
                  </Heading>
                  <Text fontSize='lg' opacity={0.9} maxW='2xl' color='gray.200'>
                     Experience the full application with interactive demos, or
                     review the complete source code to explore the
                     implementation details and architecture decisions.
                  </Text>
                  <HStack spacing={4}>
                     <Button
                        size='lg'
                        bg='white'
                        color='purple.600'
                        _hover={{
                           bg: 'purple.50',
                           transform: 'translateY(-2px)'
                        }}
                        rightIcon={<PiArrowRight size={20} />}
                        onClick={() => navigate('/register')}
                        shadow='lg'
                     >
                        Try Demo
                     </Button>
                     <Button
                        size='lg'
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
                  <Text fontSize='sm' opacity={0.8} color='white'>
                     • Interactive application demo • Complete source code
                     available • Documentation included
                  </Text>
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
                     <Badge
                        variant='outline'
                        colorScheme='purple'
                        borderRadius={4}
                        display='flex'
                        alignItems='center'
                        justifyContent='center'
                     >
                        Demo Application
                     </Badge>
                  </HStack>

                  <Text color='text.secondary' fontSize='sm'>
                     Full-stack task management application demonstration
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
