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

// Utils
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// =============================================================================
// CONSTANTS
// =============================================================================

const TECH_STACK = [
   {
      category: 'Frontend',
      technologies: [
         {
            name: 'React 18',
            description: 'Modern UI library with hooks',
            icon: PiCode
         },
         {
            name: 'Chakra UI',
            description: 'Component library for styling',
            icon: PiPalette
         },
         {
            name: 'Redux Toolkit',
            description: 'State management',
            icon: PiDatabase
         },
         {
            name: 'React Router',
            description: 'Client-side routing',
            icon: PiDevices
         },
         {
            name: 'React Hook Form',
            description: 'Form validation & handling',
            icon: PiCheckCircle
         }
      ]
   },
   {
      category: 'Backend & Tools',
      technologies: [
         {
            name: 'Node.js',
            description: 'Server-side JavaScript runtime',
            icon: PiGear
         },
         {
            name: 'Express.js',
            description: 'Web application framework',
            icon: PiRocket
         },
         { name: 'MongoDB', description: 'NoSQL database', icon: PiDatabase },
         {
            name: 'JWT Auth',
            description: 'Secure authentication',
            icon: PiShield
         },
         {
            name: 'i18next',
            description: 'Internationalization support',
            icon: PiGlobe
         }
      ]
   },
   {
      category: 'Features',
      technologies: [
         {
            name: 'Drag & Drop',
            description: 'Intuitive task management',
            icon: PiKanban
         },
         {
            name: 'Calendar View',
            description: 'Schedule & timeline view',
            icon: PiCalendar
         },
         {
            name: 'Dark/Light Mode',
            description: 'Theme customization',
            icon: PiPalette
         },
         {
            name: 'Multi-language',
            description: 'English & Japanese support',
            icon: PiGlobe
         },
         {
            name: 'Responsive Design',
            description: 'Works on all devices',
            icon: PiDevices
         }
      ]
   }
]

const FEATURES = [
   {
      title: 'Kanban Board',
      description:
         'Organize tasks with drag-and-drop functionality across customizable columns',
      icon: PiKanban,
      color: 'blue'
   },
   {
      title: 'Calendar Integration',
      description: 'View tasks in calendar format with scheduling capabilities',
      icon: PiCalendar,
      color: 'green'
   },
   {
      title: 'Team Collaboration',
      description:
         'Share projects and collaborate with team members in real-time',
      icon: PiUsers,
      color: 'purple'
   },
   {
      title: 'Customizable Themes',
      description:
         'Switch between dark and light modes with beautiful color schemes',
      icon: PiPalette,
      color: 'orange'
   }
]

const DEMO_FEATURES = [
   {
      id: 'kanban-demo',
      title: 'Powerful Kanban Board',
      subtitle: 'Drag, Drop, and Organize with Ease',
      description:
         'Experience seamless task management with our intuitive Kanban board. Create custom columns, drag tasks between stages, and track progress in real-time. Perfect for agile workflows and project management.',
      features: [
         'Drag & drop task cards between columns',
         'Customizable column colors and names',
         'Real-time updates across team members',
         'Task priorities and due dates',
         'Progress tracking and analytics'
      ],
      mediaType: 'video',
      mediaSrc: '/assets/videos/kanban-demo.mp4',
      mediaAlt: 'Kanban board drag and drop demonstration',
      reversed: false
   },
   {
      id: 'calendar-demo',
      title: 'Integrated Calendar View',
      subtitle: 'Schedule and Timeline Management',
      description:
         'Switch seamlessly between Kanban and Calendar views to see your tasks in a timeline format. Schedule deadlines, view upcoming tasks, and manage your workflow with powerful calendar integration.',
      features: [
         'Multiple calendar views (month, week, day)',
         'Task scheduling with drag & drop',
         'Deadline notifications and reminders',
         'Integration with external calendars',
         'Multi-language date formatting'
      ],
      mediaType: 'image',
      mediaSrc: '/assets/images/calendar-view.png',
      mediaAlt: 'Calendar view showing scheduled tasks',
      reversed: true
   },
   {
      id: 'themes-demo',
      title: 'Beautiful Dark & Light Themes',
      subtitle: 'Customize Your Experience',
      description:
         'Work comfortably in any environment with our carefully crafted dark and light themes. Automatic theme switching, custom color schemes, and accessibility-focused design ensure the perfect viewing experience.',
      features: [
         'Automatic dark/light mode detection',
         'Custom color schemes for projects',
         'High contrast accessibility options',
         'Smooth theme transitions',
         'Per-user theme preferences'
      ],
      mediaType: 'image',
      mediaSrc: '/assets/images/theme-comparison.png',
      mediaAlt: 'Side-by-side comparison of dark and light themes',
      reversed: false
   },
   {
      id: 'collaboration-demo',
      title: 'Real-time Team Collaboration',
      subtitle: 'Work Together, Achieve More',
      description:
         'Collaborate with your team in real-time. Share projects, assign tasks, track progress, and communicate effectively. Built for modern distributed teams with multilingual support.',
      features: [
         'Real-time collaborative editing',
         'Team member assignments and notifications',
         'Project sharing and permissions',
         'Activity feeds and updates',
         'Multi-language interface (EN/JP)'
      ],
      mediaType: 'video',
      mediaSrc: '/assets/videos/collaboration-demo.mp4',
      mediaAlt: 'Team collaboration features demonstration',
      reversed: true
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
         <Heading size='lg' color='accent.primary'>
            <Image
               src='/assets/img/pura-logo.png'
               alt='Pura Logo'
               height='40px'
               cursor='pointer'
               onClick={() => navigate('/')}
            />
         </Heading>

         <HStack spacing={4}>
            <LanguageSwitcher />
            <Button variant='ghost' onClick={() => navigate('/login')}>
               {t('nav-login')}
            </Button>
            <Button colorScheme='purple' onClick={() => navigate('/register')}>
               {t('nav-get-started')}
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
               🚀 Modern Task Management
            </Badge>

            <Heading
               size='3xl'
               fontWeight='bold'
               lineHeight='shorter'
               bgGradient='linear(to-r, purple.400, blue.500)'
               bgClip='text'
            >
               {t('hero-title')}
            </Heading>

            <Text
               fontSize='xl'
               color='text.secondary'
               maxW='2xl'
               lineHeight='tall'
            >
               {t('hero-description')}
            </Text>

            <HStack spacing={4} pt={4}>
               <Button
                  size='lg'
                  colorScheme='purple'
                  rightIcon={<PiArrowRight />}
                  onClick={() => navigate('/register')}
               >
                  {t('btn-start-free')}
               </Button>
               <Button
                  size='lg'
                  variant='outline'
                  onClick={() => navigate('/login')}
               >
                  {t('btn-sign-in')}
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
               <Heading size='2xl'>{t('features-title')}</Heading>
               <Text fontSize='lg' color='text.secondary' maxW='2xl'>
                  {t('features-description')}
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
 * Demo feature section with media
 */
const DemoFeatureSection = React.memo(({ feature, index }) => {
   const [isVideoPlaying, setIsVideoPlaying] = useState(false)

   const handleVideoPlay = useCallback(() => {
      setIsVideoPlaying(true)
   }, [])

   const mediaContent = useMemo(() => {
      if (feature.mediaType === 'video') {
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
                        src={`${feature.mediaSrc.replace(
                           '.mp4',
                           '-thumbnail.jpg'
                        )}`}
                        alt={feature.mediaAlt}
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
                     <source src={feature.mediaSrc} type='video/mp4' />
                     Your browser does not support the video tag.
                  </Box>
               )}
            </Box>
         )
      }

      return (
         <Image
            src={feature.mediaSrc}
            alt={feature.mediaAlt}
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
   }, [feature, isVideoPlaying, handleVideoPlay])

   const content = (
      <VStack align='start' spacing={6} flex={1}>
         <Badge colorScheme='purple' variant='subtle' px={3} py={1}>
            <Icon
               as={feature.mediaType === 'video' ? PiVideo : PiImage}
               mr={2}
            />
            {feature.mediaType === 'video'
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

         <VStack align='start' spacing={3} w='full'>
            {feature.features.map((item, idx) => (
               <HStack key={idx} spacing={3} align='start'>
                  <Icon
                     as={PiCheckCircle}
                     color='green.500'
                     mt={1}
                     flexShrink={0}
                  />
                  <Text fontSize='sm' color='text.primary'>
                     {item}
                  </Text>
               </HStack>
            ))}
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
      features: PropTypes.arrayOf(PropTypes.string).isRequired,
      mediaType: PropTypes.oneOf(['image', 'video']).isRequired,
      mediaSrc: PropTypes.string.isRequired,
      mediaAlt: PropTypes.string.isRequired,
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
               <Heading size='lg' mb={6} color='accent.primary'>
                  {category.category}
               </Heading>
               <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                  {category.technologies.map((tech, techIndex) => (
                     <Card
                        key={techIndex}
                        variant='filled'
                        size='sm'
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
                                 <Text fontSize='sm' color='text.muted'>
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
                     {t('tech-badge')}
                  </Badge>
                  <Heading size='2xl'>{t('tech-title')}</Heading>
                  <Text fontSize='lg' color='text.secondary' maxW='2xl'>
                     {t('tech-description')}
                  </Text>
               </VStack>

               <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={12} w='full'>
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
                  <Icon as={PiStar} boxSize={16} color='yellow.400' />
                  <Heading size='xl' color='white'>
                     {t('cta-title')}
                  </Heading>
                  <Text fontSize='lg' opacity={0.9} maxW='2xl'>
                     {t('cta-description')}
                  </Text>
                  <Button
                     size='lg'
                     bg='white'
                     color='purple.600'
                     _hover={{ bg: 'gray.100' }}
                     rightIcon={<PiArrowRight />}
                     onClick={() => navigate('/register')}
                  >
                     {t('btn-start-now')}
                  </Button>
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
               <Divider />
               <Flex
                  w='full'
                  justifyContent='space-between'
                  alignItems='center'
                  flexDirection={{ base: 'column', md: 'row' }}
                  gap={4}
               >
                  <HStack spacing={2}>
                     <Heading size='md' color='accent.primary'>
                        TaskFlow Pro
                     </Heading>
                     <Badge variant='outline'>v1.0</Badge>
                  </HStack>

                  <Text color='text.muted' fontSize='sm'>
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
