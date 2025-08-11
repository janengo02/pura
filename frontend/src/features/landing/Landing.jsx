// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useMemo, useCallback, useState } from 'react'
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
   Center,
   useColorMode
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
   PiTarget,
   PiHouseBold
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
      categoryKey: 'landing-frontend-implementation',
      technologies: [
         {
            nameKey: 'landing-react-hooks',
            descriptionKey: 'landing-react-hooks-desc',
            icon: PiCode
         },
         {
            nameKey: 'landing-redux',
            descriptionKey: 'landing-redux-desc',
            icon: PiDatabase
         },
         {
            nameKey: 'landing-chakra-ui',
            descriptionKey: 'landing-chakra-ui-desc',
            icon: PiPalette
         },
         {
            nameKey: 'landing-react-hook-form',
            descriptionKey: 'landing-react-hook-form-desc',
            icon: PiCheckCircle
         },
         {
            nameKey: 'landing-modern-libraries',
            descriptionKey: 'landing-modern-libraries-desc',
            icon: PiKanban
         },
         {
            nameKey: 'landing-i18next-integration',
            descriptionKey: 'landing-i18next-integration-desc',
            icon: PiGlobe
         }
      ]
   },
   {
      categoryKey: 'landing-backend-architecture',
      technologies: [
         {
            nameKey: 'landing-nodejs-express',
            descriptionKey: 'landing-nodejs-express-desc',
            icon: PiGear
         },
         {
            nameKey: 'landing-mongodb-mongoose',
            descriptionKey: 'landing-mongodb-mongoose-desc',
            icon: PiDatabase
         },
         {
            nameKey: 'landing-jwt-authentication',
            descriptionKey: 'landing-jwt-authentication-desc',
            icon: PiShield
         },
         {
            nameKey: 'landing-google-apis',
            descriptionKey: 'landing-google-apis-desc',
            icon: PiCalendar
         },
         {
            nameKey: 'landing-google-oauth',
            descriptionKey: 'landing-google-oauth-desc',
            icon: PiUsers
         },
         {
            nameKey: 'landing-protected-routes',
            descriptionKey: 'landing-protected-routes-desc',
            icon: PiShield
         }
      ]
   }
]

const FEATURES = [
   {
      titleKey: 'landing-interactive-kanban',
      descriptionKey: 'landing-interactive-kanban-desc',
      icon: PiKanban,
      color: 'blue'
   },
   {
      titleKey: 'landing-google-calendar-sync',
      descriptionKey: 'landing-google-calendar-sync-desc',
      icon: PiCalendar,
      color: 'green'
   },
   {
      titleKey: 'landing-task-management-system',
      descriptionKey: 'landing-task-management-system-desc',
      icon: PiClock,
      color: 'purple'
   },
   {
      titleKey: 'landing-internationalization',
      descriptionKey: 'landing-internationalization-desc',
      icon: PiGlobe,
      color: 'orange'
   }
]

const DEMO_FEATURES = [
   {
      id: 'kanban-demo',
      titleKey: 'landing-kanban-implementation',
      subtitleKey: 'landing-kanban-subtitle',
      descriptionKey: 'landing-kanban-description',
      features: [
         {
            titleKey: 'landing-drag-drop-interface',
            descriptionKey: 'landing-drag-drop-interface-desc',
            mediaType: 'video',
            mediaSrc: '/assets/img/preview/kanban-1.mov',
            mediaAlt: 'Kanban board drag and drop functionality demonstration'
         },
         {
            titleKey: 'landing-customizable-layouts',
            descriptionKey: 'landing-customizable-layouts-desc',
            mediaType: 'image',
            mediaSrc: '/assets/img/preview/kanban-2.png',
            mediaAlt: 'Customizable Kanban board layout options'
         },
         {
            titleKey: 'landing-task-scheduling',
            descriptionKey: 'landing-task-scheduling-desc',
            mediaType: 'image',
            mediaSrc: '/assets/img/preview/kanban-3.png',
            mediaAlt: 'Task creation modal with scheduling interface'
         },
         {
            titleKey: 'landing-advanced-filtering',
            descriptionKey: 'landing-advanced-filtering-desc',
            mediaType: 'video',
            mediaSrc: '/assets/img/preview/kanban-4.mov',
            mediaAlt: 'Task filtering and search interface'
         }
      ],
      reversed: false
   },
   {
      id: 'calendar-demo',
      titleKey: 'landing-calendar-integration',
      subtitleKey: 'landing-calendar-integration-subtitle',
      descriptionKey: 'landing-calendar-integration-description',
      features: [
         {
            titleKey: 'landing-oauth-authentication',
            descriptionKey: 'landing-oauth-authentication-desc',
            mediaType: 'image',
            mediaSrc: '/assets/img/preview/calendar-1.png',
            mediaAlt: 'Google OAuth authentication flow'
         },
         {
            titleKey: 'landing-multiple-view-modes',
            descriptionKey: 'landing-multiple-view-modes-desc',
            mediaType: 'image',
            mediaSrc: '/assets/img/preview/calendar-2.png',
            mediaAlt: 'Calendar application with multiple view options'
         },
         {
            titleKey: 'landing-event-management',
            descriptionKey: 'landing-event-management-desc',
            mediaType: 'image',
            mediaSrc: '/assets/img/preview/calendar-3.png',
            mediaAlt: 'Google Calendar event management interface'
         },
         {
            titleKey: 'landing-conflict-detection',
            descriptionKey: 'landing-conflict-detection-desc',
            mediaType: 'image',
            mediaSrc: '/assets/img/preview/calendar-4.png',
            mediaAlt: 'Calendar conflict detection and resolution system'
         }
      ],
      reversed: true
   },
   {
      id: 'ux-demo',
      titleKey: 'landing-ux-design',
      subtitleKey: 'landing-ux-design-subtitle',
      descriptionKey: 'landing-ux-design-description',
      features: [
         {
            titleKey: 'landing-theme-system',
            descriptionKey: 'landing-theme-system-desc',
            mediaType: 'video',
            mediaSrc: '/assets/img/preview/ux-1.mov',
            mediaAlt: 'Dark and light theme switching demonstration'
         },
         {
            titleKey: 'landing-internationalization-feature',
            descriptionKey: 'landing-internationalization-feature-desc',
            mediaType: 'video',
            mediaSrc: '/assets/img/preview/ux-2.mov',
            mediaAlt:
               'Language switching interface between English and Japanese'
         },
         {
            titleKey: 'landing-optimistic-updates',
            descriptionKey: 'landing-optimistic-updates-desc',
            mediaType: 'video',
            mediaSrc: '/assets/img/preview/ux-3.mov',
            mediaAlt: 'Optimistic UI updates with error handling'
         },
         {
            titleKey: 'landing-form-validation',
            descriptionKey: 'landing-form-validation-desc',
            mediaType: 'image',
            mediaSrc: '/assets/img/preview/ux-4.png',
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
export const LandingHeader = React.memo(({ isAuthenticated }) => {
   const navigate = useNavigate()
   const { t } = useReactiveTranslation()
   const { colorMode } = useColorMode()

   const authButtons = useMemo(() => {
      if (isAuthenticated) {
         return (
            <Button
               colorScheme='purple'
               onClick={() => navigate('/dashboard')}
               leftIcon={<PiHouseBold size={16} />}
            >
               {t('btn-dashboard')}
            </Button>
         )
      }

      return (
         <>
            <Button variant='ghost' onClick={() => navigate('/login')}>
               {t('landing-demo-login')}
            </Button>
            <Button colorScheme='purple' onClick={() => navigate('/register')}>
               {t('landing-register')}
            </Button>
         </>
      )
   }, [isAuthenticated, navigate, t])

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
               src={
                  colorMode === 'dark'
                     ? '/assets/img/pura-logo-white.svg'
                     : '/assets/img/pura-logo-purple.svg'
               }
               alt='Pura Logo'
               height='40px'
               cursor='pointer'
               onClick={() => navigate('/')}
            />
         </Heading>

         <HStack spacing={4}>
            <ThemeToggle asMenuItem={false} />
            <LanguageSwitcher />
            {authButtons}
         </HStack>
      </Flex>
   )
})

LandingHeader.displayName = 'LandingHeader'

LandingHeader.propTypes = {
   isAuthenticated: PropTypes.bool
}

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
               {t('landing-task-management-app')}
            </Badge>

            <Heading
               size='3xl'
               fontWeight='bold'
               lineHeight='shorter'
               bgGradient='linear(to-r, purple.400, blue.500)'
               bgClip='text'
            >
               {t('landing-pura-timeboxing-tool')}
            </Heading>

            <Text
               fontSize='xl'
               color='text.secondary'
               lineHeight='tall'
               maxW='3xl'
            >
               {t('landing-hero-description')}
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
                  {t('landing-explore-application')}
               </Button>
               <Button
                  size='lg'
                  variant='outline'
                  leftIcon={<PiCode size={20} />}
                  onClick={() =>
                     window.open('https://github.com/janengo02/pura', '_blank')
                  }
               >
                  {t('landing-view-source')}
               </Button>
            </HStack>

            <Text fontSize='sm' color='text.secondary' mt={4}>
               {t('landing-interactive-demo-available')}
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
                        {t(feature.titleKey)}
                     </Heading>
                     <Text color='text.secondary' lineHeight='tall'>
                        {t(feature.descriptionKey)}
                     </Text>
                  </VStack>
               </CardBody>
            </Card>
         )),
      [t]
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
                  {t('landing-key-features')}
               </Badge>
               <Heading size='2xl'>{t('landing-application-overview')}</Heading>
               <Text fontSize='lg' color='text.secondary' maxW='3xl'>
                  {t('landing-core-functionality')}
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
   const { t } = useReactiveTranslation()

   const [selectedFeature, setSelectedFeature] = useState(0)

   const currentFeature = feature.features[selectedFeature]

   const handleFeatureSelect = useCallback((featureIndex) => {
      setSelectedFeature(featureIndex)
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
               <Box 
                  as='video' 
                  key={currentFeature.mediaSrc}
                  w='full' 
                  h='auto'
                  maxW='full'
                  autoPlay 
                  loop 
                  muted
                  playsInline
               >
                  <source src={currentFeature.mediaSrc} type='video/mp4' />
                  Your browser does not support the video tag.
               </Box>
            </Box>
         )
      }

      return (
         <Image
            src={currentFeature.mediaSrc}
            alt={currentFeature.mediaAlt}
            maxW='full'
            h='auto'
            borderRadius='xl'
            shadow='2xl'
            _hover={{ transform: 'scale(1.02)' }}
            transition='transform 0.3s'
            fallbackSrc='https://via.placeholder.com/800x400/805AD5/FFFFFF?text=Feature+Preview'
         />
      )
   }, [currentFeature])

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
            {t('landing-implementation-preview')}
         </Badge>

         <VStack align='start' spacing={4}>
            <Heading size='xl' color='text.primary'>
               {t(feature.titleKey)}
            </Heading>
            <Text fontSize='lg' color='accent.primary' fontWeight='semibold'>
               {t(feature.subtitleKey)}
            </Text>
            <Text fontSize='md' color='text.primary' lineHeight='tall'>
               {t(feature.descriptionKey)}
            </Text>
         </VStack>

         <VStack align='start' spacing={4} w='full'>
            <Text fontSize='md' fontWeight='semibold' color='text.primary'>
               {t('landing-implementation-details')}
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
                           {t(item.titleKey)}
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
                           {t(item.descriptionKey)}
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
      titleKey: PropTypes.string.isRequired,
      subtitleKey: PropTypes.string.isRequired,
      descriptionKey: PropTypes.string.isRequired,
      features: PropTypes.arrayOf(
         PropTypes.shape({
            titleKey: PropTypes.string.isRequired,
            descriptionKey: PropTypes.string.isRequired,
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
                  {t(category.categoryKey)}
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
                                 <Text fontWeight='bold'>
                                    {t(tech.nameKey)}
                                 </Text>
                                 <Text fontSize='sm' color='text.secondary'>
                                    {t(tech.descriptionKey)}
                                 </Text>
                              </Box>
                           </HStack>
                        </CardBody>
                     </Card>
                  ))}
               </SimpleGrid>
            </Box>
         )),
      [t]
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
                  {t('landing-technical-implementation')}
               </Badge>
               <Heading size='2xl'>{t('landing-technology-stack')}</Heading>
               <Text fontSize='lg' color='text.secondary' maxW='3xl'>
                  {t('landing-tech-stack-description')}
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
                     {t('landing-explore-application-cta')}
                  </Heading>
                  <Text fontSize='lg' opacity={0.9} maxW='2xl' color='gray.200'>
                     {t('landing-cta-description')}
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
                        {t('landing-try-demo')}
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
                        {t('landing-view-source')}
                     </Button>
                  </HStack>
                  <Text fontSize='sm' opacity={0.8} color='white'>
                     {t('landing-cta-features')}
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
                     {t('landing-footer-description')}
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

const Landing = React.memo(({ landingData, isAuthenticated }) => {
   // -------------------------------------------------------------------------
   // RENDER
   // -------------------------------------------------------------------------
   return (
      <Box minH='100vh' bg='bg.surface'>
         <LandingHeader isAuthenticated={isAuthenticated} />
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
   landingData: PropTypes.object,
   isAuthenticated: PropTypes.bool
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectLandingData = createSelector(
   [
      // Add selectors if needed
      (state) => state.language?.current || 'en',
      (state) => state.theme?.current || 'light'
   ],
   (language, theme) => ({
      language,
      theme
   })
)

const selectAuthState = createSelector(
   [(state) => state.auth?.isAuthenticated || false],
   (isAuthenticated) => isAuthenticated
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   landingData: selectLandingData(state),
   isAuthenticated: selectAuthState(state)
})

const mapDispatchToProps = {
   // Add action creators if needed
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Landing)
