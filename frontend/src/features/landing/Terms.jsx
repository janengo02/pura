// =============================================================================
// IMPORTS
// =============================================================================

// React & Hooks
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { createSelector } from 'reselect'

// UI Components
import {
   Box,
   Container,
   Heading,
   Text,
   VStack,
   HStack,
   Link,
   List,
   ListItem,
   Divider,
   Card,
   CardBody,
   Flex,
   Badge
} from '@chakra-ui/react'

// Icons
import { PiShield } from 'react-icons/pi'

// Internal Components
import { Footer, LandingHeader } from './Landing'
import LanguageSwitcher from '../../components/LanguageSwitcher'
import ThemeToggle from '../../components/ThemeToggle'

// Utils
import { useReactiveTranslation } from '../../hooks/useReactiveTranslation'

// =============================================================================
// COMPONENTS
// =============================================================================

/**
 * Terms page hero section
 */
const TermsHero = React.memo(() => {
   return (
      <Container maxW='7xl' py={20}>
         <VStack spacing={8} textAlign='center'>
            <Heading
               size='3xl'
               fontWeight='bold'
               lineHeight='shorter'
               bgGradient='linear(to-r, purple.400, blue.500)'
               bgClip='text'
            >
               Privacy Policy
            </Heading>

            <Text
               fontSize='xl'
               color='text.secondary'
               lineHeight='tall'
               maxW='3xl'
            >
               Protecting your privacy and data with transparency and security
            </Text>

            <Text fontSize='md' color='text.secondary'>
               Last updated: August 14, 2025
            </Text>
         </VStack>
      </Container>
   )
})

TermsHero.displayName = 'TermsHero'

/**
 * Introduction section
 */
const IntroSection = React.memo(() => {
   return (
      <Container maxW='4xl' py={8}>
         <VStack spacing={6} align='start'>
            <Text fontSize='lg' lineHeight='tall'>
               <Text as='strong'>This Privacy Notice for PURA</Text> ("we,"
               "us," or "our") describes how and why we might access, collect,
               store, use, and/or share ("process") your personal information
               when you use our services ("Services"), including when you:
            </Text>

            <List spacing={3} ml={6}>
               <ListItem>
                  Visit our website at{' '}
                  <Link
                     href='https://pura-production.up.railway.app'
                     isExternal
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     https://pura-production.up.railway.app
                  </Link>{' '}
                  or any website of ours that links to this Privacy Notice
               </ListItem>
               <ListItem>
                  Use our application features, including task management and calendar integration
               </ListItem>
            </List>

            <Text fontSize='lg' lineHeight='tall'>
               <Text as='strong'>Questions or concerns?</Text> Reading this
               Privacy Notice will help you understand your privacy rights and
               choices. We are responsible for making decisions about how your
               personal information is processed. If you do not agree with our
               policies and practices, please do not use our Services. If you
               still have any questions or concerns, please contact us at{' '}
               <Link
                  href='mailto:janengo.work@gmail.com'
                  color='accent.secondary'
                  fontWeight='semibold'
               >
                  janengo.work@gmail.com
               </Link>
               .
            </Text>
         </VStack>
      </Container>
   )
})

IntroSection.displayName = 'IntroSection'

/**
 * Summary section
 */
const SummarySection = React.memo(() => {
   return (
      <Container maxW='4xl' py={8}>
         <VStack spacing={6} align='start'>
            <Heading size='lg' color='accent.secondary'>
               SUMMARY OF KEY POINTS
            </Heading>

            <Text fontSize='md' fontStyle='italic' color='gray.600'>
               <Text as='strong'>
                  This summary provides key points from our Privacy Notice, but
                  you can find out more details about any of these topics by
                  clicking the link following each key point or by using our
                  table of contents below to find the section you are looking
                  for.
               </Text>
            </Text>

            <VStack spacing={4} align='start'>
               <Text>
                  <Text as='strong'>
                     What personal information do we process?
                  </Text>{' '}
                  When you visit, use, or navigate our Services, we may process
                  personal information depending on how you interact with us and
                  the Services, the choices you make, and the products and
                  features you use.{' '}
                  <Link
                     href='#personalinfo'
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     Learn more about personal information you disclose to us
                  </Link>
                  .
               </Text>

               <Text>
                  <Text as='strong'>
                     Do we process any sensitive personal information?
                  </Text>{' '}
                  Some of the information may be considered "special" or
                  "sensitive" in certain jurisdictions, for example your racial
                  or ethnic origins, sexual orientation, and religious beliefs.
                  We do not process sensitive personal information.
               </Text>

               <Text>
                  <Text as='strong'>
                     Do we collect any information from third parties?
                  </Text>{' '}
                  We collect limited information from Google services solely to provide the functionality you request, such as calendar integration and authentication.
               </Text>

               <Text>
                  <Text as='strong'>How do we process your information?</Text>{' '}
                  We process your information exclusively to provide and maintain our Services, ensure security, and comply with legal obligations. We do not use your information for marketing, advertising, or commercial purposes.{' '}
                  <Link
                     href='#infouse'
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     Learn more about how we process your information
                  </Link>
                  .
               </Text>

               <Text>
                  <Text as='strong'>
                     In what situations and with which parties do we share
                     personal information?
                  </Text>{' '}
                  We may share information in specific situations and with
                  specific third parties.{' '}
                  <Link
                     href='#whoshare'
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     Learn more about when and with whom we share your personal
                     information
                  </Link>
                  .
               </Text>

               <Text>
                  <Text as='strong'>How do we keep your information safe?</Text>{' '}
                  We have adequate organizational and technical processes and
                  procedures in place to protect your personal information.
                  However, no electronic transmission over the internet or
                  information storage technology can be guaranteed to be 100%
                  secure, so we cannot promise or guarantee that hackers,
                  cybercriminals, or other unauthorized third parties will not
                  be able to defeat our security and improperly collect, access,
                  steal, or modify your information.{' '}
                  <Link
                     href='#infosafe'
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     Learn more about how we keep your information safe
                  </Link>
                  .
               </Text>

               <Text>
                  <Text as='strong'>What are your rights?</Text> Depending on
                  where you are located geographically, the applicable privacy
                  law may mean you have certain rights regarding your personal
                  information.{' '}
                  <Link
                     href='#privacyrights'
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     Learn more about your privacy rights
                  </Link>
                  .
               </Text>

               <Text>
                  <Text as='strong'>How do you exercise your rights?</Text> The
                  easiest way to exercise your rights is by submitting a{' '}
                  <Link
                     href='https://app.termly.io/notify/304e23d6-4332-4b89-83d6-d430594890d3'
                     isExternal
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     data subject access request
                  </Link>
                  , or by contacting us. We will consider and act upon any
                  request in accordance with applicable data protection laws.
               </Text>

               <Text>
                  Want to learn more about what we do with any information we
                  collect?{' '}
                  <Link
                     href='#toc'
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     Review the Privacy Notice in full
                  </Link>
                  .
               </Text>
            </VStack>
         </VStack>
      </Container>
   )
})

SummarySection.displayName = 'SummarySection'

/**
 * Table of Contents section
 */
const TableOfContents = React.memo(() => {
   const sections = [
      { href: '#infocollect', title: '1. WHAT INFORMATION DO WE COLLECT?' },
      { href: '#infouse', title: '2. HOW DO WE PROCESS YOUR INFORMATION?' },
      {
         href: '#whoshare',
         title: '3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?'
      },
      {
         href: '#inforetain',
         title: '4. HOW LONG DO WE KEEP YOUR INFORMATION?'
      },
      { href: '#infosafe', title: '5. HOW DO WE KEEP YOUR INFORMATION SAFE?' },
      { href: '#privacyrights', title: '6. WHAT ARE YOUR PRIVACY RIGHTS?' },
      { href: '#DNT', title: '7. CONTROLS FOR DO-NOT-TRACK FEATURES' },
      {
         href: '#policyupdates',
         title: '8. DO WE MAKE UPDATES TO THIS NOTICE?'
      },
      {
         href: '#contact',
         title: '9. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?'
      },
      {
         href: '#request',
         title: '10. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT FROM YOU?'
      }
   ]

   return (
      <Container maxW='4xl' py={8} id='toc'>
         <Card variant='outline' bg='gray.50' _dark={{ bg: 'gray.800' }}>
            <CardBody p={8}>
               <VStack spacing={6} align='start'>
                  <HStack spacing={3} color='accent.primary'>
                     <PiShield size={24} />
                     <Heading size='lg' color='accent.primary'>
                        TABLE OF CONTENTS
                     </Heading>
                  </HStack>

                  <VStack spacing={3} align='start' w='full'>
                     {sections.map((section, index) => (
                        <Box key={index} position='relative' pl={6}>
                           <Text
                              position='absolute'
                              left={0}
                              color='accent.primary'
                              fontWeight='bold'
                           >
                              →
                           </Text>
                           <Link
                              href={section.href}
                              color='accent.primary'
                              fontWeight='semibold'
                              _hover={{ textDecoration: 'underline' }}
                           >
                              {section.title}
                           </Link>
                        </Box>
                     ))}
                  </VStack>
               </VStack>
            </CardBody>
         </Card>
      </Container>
   )
})

TableOfContents.displayName = 'TableOfContents'

/**
 * Information Collection section
 */
const InfoCollectionSection = React.memo(() => {
   return (
      <Container maxW='4xl' py={8} id='infocollect'>
         <VStack spacing={8} align='start'>
            <Heading
               size='xl'
               color='accent.secondary'
               borderBottom='2px'
               borderColor='gray.200'
               pb={2}
            >
               1. WHAT INFORMATION DO WE COLLECT?
            </Heading>

            <Box id='personalinfo'>
               <Heading size='lg' mb={4}>
                  Personal information you disclose to us
               </Heading>
               <Text fontSize='md' fontStyle='italic' color='gray.600' mb={4}>
                  <Text as='strong'>
                     In Short: We collect personal information that you provide
                     to us.
                  </Text>
               </Text>

               <Text mb={4}>
                  We collect personal information that you voluntarily provide
                  to us when you register on the Services, express an interest
                  in obtaining information about us or our products and
                  Services, when you participate in activities on the Services,
                  or otherwise when you contact us.
               </Text>

               <Text mb={4}>
                  <Text as='strong'>Personal Information Provided by You.</Text>{' '}
                  The personal information that we collect depends on the
                  context of your interactions with us and the Services, the
                  choices you make, and the products and features you use. The
                  personal information we collect may include the following:
               </Text>

               <List spacing={2} ml={6} mb={6}>
                  <ListItem>names</ListItem>
                  <ListItem>email addresses</ListItem>
                  <ListItem>usernames</ListItem>
                  <ListItem>passwords</ListItem>
               </List>
            </Box>

            <Box>
               <Heading size='lg' mb={4}>
                  Information collected from third parties
               </Heading>
               <Text fontSize='md' fontStyle='italic' color='gray.600' mb={4}>
                  <Text as='strong'>
                     In Short: We collect limited data from third-party services solely to provide application functionality.
                  </Text>
               </Text>

               <Text mb={4}>
                  To enable the core functionality of our Services, we may obtain information about you from the following third-party sources:
               </Text>

               <List spacing={3} ml={6} mb={6}>
                  <ListItem>
                     <Text as='strong'>Google OAuth Services:</Text> When you choose
                     to authenticate with Google, we receive only your basic profile information (name, email
                     address, profile picture) as necessary for account creation and identification.
                  </ListItem>
                  <ListItem>
                     <Text as='strong'>Google Calendar API:</Text> With your
                     explicit consent, we access your Google Calendar data strictly for the purpose of
                     synchronizing tasks and events within our application. This includes calendar events,
                     attendees, scheduling information, and meeting details.
                  </ListItem>
                  <ListItem>
                     <Text as='strong'>Google Meet Integration:</Text> We generate
                     Google Meet links through the Google Calendar API solely when you create events that require video conferencing functionality.
                  </ListItem>
               </List>

               <Text mb={4}>
                  <Text as='strong'>Google API Services Data Handling:</Text> Our application
                  integrates with Google API Services under the following conditions:
               </Text>

               <List spacing={2} ml={6} mb={6}>
                  <ListItem>
                     We request only the minimum scope of permissions required for the specific functionality you choose to use
                  </ListItem>
                  <ListItem>
                     All Google data is processed strictly in accordance with Google's Privacy Policy and API Terms of Service
                  </ListItem>
                  <ListItem>
                     You maintain full control and can revoke our application's access at any time through your Google Account settings
                  </ListItem>
                  <ListItem>
                     We do not store your Google credentials - all authentication is handled through secure OAuth 2.0 protocols
                  </ListItem>
                  <ListItem>
                     Google data is used exclusively for application functionality and is never used for marketing, advertising, or commercial purposes
                  </ListItem>
               </List>

               <Text mb={4}>
                  <Text as='strong'>Sensitive Information.</Text> We do not
                  process sensitive personal information as defined by applicable privacy laws. Any calendar data processed is limited to what is necessary for the functionality you have specifically requested.
               </Text>

               <Text>
                  All personal information that you provide to us must be true,
                  complete, and accurate, and you must notify us of any changes
                  to such personal information.
               </Text>
            </Box>
         </VStack>
      </Container>
   )
})

InfoCollectionSection.displayName = 'InfoCollectionSection'

/**
 * Information Use section
 */
const InfoUseSection = React.memo(() => {
   return (
      <Container maxW='4xl' py={8} id='infouse'>
         <VStack spacing={6} align='start'>
            <Heading
               size='xl'
               color='accent.secondary'
               borderBottom='2px'
               borderColor='gray.200'
               pb={2}
            >
               2. HOW DO WE PROCESS YOUR INFORMATION?
            </Heading>

            <Text fontSize='md' fontStyle='italic' color='gray.600'>
               <Text as='strong'>
                  In Short: We process your information exclusively to provide and maintain our Services, ensure security, and comply with legal obligations. We do not use your information for marketing or advertising purposes.
               </Text>
            </Text>

            <Text>
               We process your personal information solely for the following legitimate purposes:
            </Text>

            <List spacing={3} ml={6}>
               <ListItem>
                  <Text as='strong'>
                     Account Management.
                  </Text>{' '}
                  We process your information to facilitate account creation, authentication, and maintenance so you can access and use our Services.
               </ListItem>
               <ListItem>
                  <Text as='strong'>
                     Service Delivery.
                  </Text>{' '}
                  We process your information to deliver the core functionality of our task management and calendar integration services.
               </ListItem>
               <ListItem>
                  <Text as='strong'>
                     Customer Support.
                  </Text>{' '}
                  We may process your information to respond to your inquiries and provide technical support for any issues you experience with our Services.
               </ListItem>
               <ListItem>
                  <Text as='strong'>
                     Google Calendar Integration.
                  </Text>{' '}
                  When you choose to connect your Google account, we process your calendar data exclusively to enable task synchronization, event creation, and scheduling features you have requested.
               </ListItem>
               <ListItem>
                  <Text as='strong'>
                     Secure Authentication.
                  </Text>{' '}
                  We utilize Google's OAuth service to provide secure authentication without storing your credentials.
               </ListItem>
               <ListItem>
                  <Text as='strong'>Video Conferencing Integration.</Text> When you create events requiring video conferencing, we generate Google Meet links through the Google Calendar API to enhance your scheduling experience.
               </ListItem>
               <ListItem>
                  <Text as='strong'>Legal Compliance.</Text> We may process your information as required to comply with applicable laws, regulations, or legal proceedings.
               </ListItem>
            </List>
         </VStack>
      </Container>
   )
})

InfoUseSection.displayName = 'InfoUseSection'

/**
 * Information Sharing section
 */
const InfoSharingSection = React.memo(() => {
   return (
      <Container maxW='4xl' py={8} id='whoshare'>
         <VStack spacing={6} align='start'>
            <Heading
               size='xl'
               color='accent.secondary'
               borderBottom='2px'
               borderColor='gray.200'
               pb={2}
            >
               3. WHEN AND WITH WHOM DO WE SHARE YOUR PERSONAL INFORMATION?
            </Heading>

            <Text fontSize='md' fontStyle='italic' color='gray.600'>
               <Text as='strong'>
                  In Short: We may share information in specific situations
                  described in this section and/or with the following third
                  parties.
               </Text>
            </Text>

            <Text>
               We may need to share your personal information in the following
               situations:
            </Text>

            <List spacing={4} ml={6}>
               <ListItem>
                  <Text as='strong'>Business Transfers.</Text> We may share or
                  transfer your information in connection with, or during
                  negotiations of, any merger, sale of company assets,
                  financing, or acquisition of all or a portion of our business
                  to another company.
               </ListItem>
               <ListItem>
                  <Text as='strong'>Third-Party Service Providers.</Text> We may
                  share your data with third-party service providers, including:
                  <List spacing={2} ml={6} mt={2}>
                     <ListItem>
                        <Text as='strong'>Google LLC:</Text> When you choose to connect your
                        Google account or utilize Google Calendar integration,
                        the minimum necessary data is transmitted to Google in strict accordance with
                        their Privacy Policy and Terms of Service for the sole purpose of providing the requested functionality.
                     </ListItem>
                     <ListItem>
                        <Text as='strong'>Google OAuth Services:</Text> Authentication
                        credentials are processed through Google's secure OAuth 2.0 system
                        exclusively for account verification and secure access to your data.
                     </ListItem>
                  </List>
               </ListItem>
               <ListItem>
                  <Text as='strong'>With your consent.</Text> We may disclose
                  your personal information for any other purpose with your
                  consent.
               </ListItem>
            </List>
         </VStack>
      </Container>
   )
})

InfoSharingSection.displayName = 'InfoSharingSection'

/**
 * Remaining sections (Data Retention, Security, Rights, etc.)
 */
const RemainingSection = React.memo(() => {
   return (
      <Container maxW='4xl' py={8}>
         <VStack spacing={12} align='start'>
            {/* Data Retention */}
            <Box id='inforetain'>
               <Heading
                  size='xl'
                  color='accent.secondary'
                  borderBottom='2px'
                  borderColor='gray.200'
                  pb={2}
                  mb={6}
               >
                  4. HOW LONG DO WE KEEP YOUR INFORMATION?
               </Heading>
               <Text fontSize='md' fontStyle='italic' color='gray.600' mb={4}>
                  <Text as='strong'>
                     In Short: We keep your information for as long as necessary
                     to fulfill the purposes outlined in this Privacy Notice
                     unless otherwise required by law.
                  </Text>
               </Text>
               <Text>
                  We will only keep your personal information for as long as it
                  is necessary for the purposes set out in this Privacy Notice,
                  unless a longer retention period is required or permitted by
                  law (such as tax, accounting, or other legal requirements).
               </Text>
            </Box>

            {/* Security */}
            <Box id='infosafe'>
               <Heading
                  size='xl'
                  color='accent.secondary'
                  borderBottom='2px'
                  borderColor='gray.200'
                  pb={2}
                  mb={6}
               >
                  5. HOW DO WE KEEP YOUR INFORMATION SAFE?
               </Heading>
               <Text fontSize='md' fontStyle='italic' color='gray.600' mb={4}>
                  <Text as='strong'>
                     In Short: We aim to protect your personal information
                     through a system of organizational and technical security
                     measures.
                  </Text>
               </Text>
               <Text>
                  We have implemented appropriate and reasonable technical and
                  organizational security measures designed to protect the
                  security of any personal information we process. However,
                  despite our safeguards and efforts to secure your information,
                  no electronic transmission over the Internet or information
                  storage technology can be guaranteed to be 100% secure.
               </Text>
            </Box>

            {/* Privacy Rights */}
            <Box id='privacyrights'>
               <Heading
                  size='xl'
                  color='accent.secondary'
                  borderBottom='2px'
                  borderColor='gray.200'
                  pb={2}
                  mb={6}
               >
                  6. WHAT ARE YOUR PRIVACY RIGHTS?
               </Heading>
               <Text fontSize='md' fontStyle='italic' color='gray.600' mb={4}>
                  <Text as='strong'>
                     In Short: You may review, change, or terminate your account
                     at any time, depending on your country, province, or state
                     of residence.
                  </Text>
               </Text>
               <VStack spacing={4} align='start'>
                  <Text>
                     <Text as='strong'>Withdrawing your consent:</Text> If we
                     are relying on your consent to process your personal
                     information, you have the right to withdraw your consent at
                     any time. You can withdraw your consent at any time by
                     contacting us.
                  </Text>
                  <Text>
                     <Text as='strong'>Account Information:</Text> If you would
                     at any time like to review or change the information in
                     your account or terminate your account, you can log in to
                     your account settings and update your user account.
                  </Text>
               </VStack>
            </Box>

            {/* Do Not Track */}
            <Box id='DNT'>
               <Heading
                  size='xl'
                  color='accent.secondary'
                  borderBottom='2px'
                  borderColor='gray.200'
                  pb={2}
                  mb={6}
               >
                  7. CONTROLS FOR DO-NOT-TRACK FEATURES
               </Heading>
               <Text>
                  Most web browsers and some mobile operating systems and mobile
                  applications include a Do-Not-Track ("DNT") feature or setting
                  you can activate to signal your privacy preference not to have
                  data about your online browsing activities monitored and
                  collected. At this stage, no uniform technology standard for
                  recognizing and implementing DNT signals has been finalized.
                  As such, we do not currently respond to DNT browser signals or
                  any other mechanism that automatically communicates your
                  choice not to be tracked online.
               </Text>
            </Box>

            {/* Policy Updates */}
            <Box id='policyupdates'>
               <Heading
                  size='xl'
                  color='accent.secondary'
                  borderBottom='2px'
                  borderColor='gray.200'
                  pb={2}
                  mb={6}
               >
                  8. DO WE MAKE UPDATES TO THIS NOTICE?
               </Heading>
               <Text fontSize='md' fontStyle='italic' color='gray.600' mb={4}>
                  <Text as='strong'>
                     In Short: Yes, we will update this notice as necessary to
                     stay compliant with relevant laws.
                  </Text>
               </Text>
               <Text>
                  We may update this Privacy Notice from time to time. The
                  updated version will be indicated by an updated "Last updated"
                  date at the top of this Privacy Notice. If we make material
                  changes to this Privacy Notice, we may notify you either by
                  prominently posting a notice of such changes or by directly
                  sending you a notification.
               </Text>
            </Box>

            {/* Contact */}
            <Box id='contact'>
               <Heading
                  size='xl'
                  color='accent.secondary'
                  borderBottom='2px'
                  borderColor='gray.200'
                  pb={2}
                  mb={6}
               >
                  9. HOW CAN YOU CONTACT US ABOUT THIS NOTICE?
               </Heading>
               <Text>
                  If you have questions or comments about this notice, you may
                  email us at{' '}
                  <Link
                     href='mailto:janengo.work@gmail.com'
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     janengo.work@gmail.com
                  </Link>
                  .
               </Text>
            </Box>

            {/* Data Rights */}
            <Box id='request'>
               <Heading
                  size='xl'
                  color='accent.secondary'
                  borderBottom='2px'
                  borderColor='gray.200'
                  pb={2}
                  mb={6}
               >
                  10. HOW CAN YOU REVIEW, UPDATE, OR DELETE THE DATA WE COLLECT
                  FROM YOU?
               </Heading>
               <Text>
                  Based on the applicable laws of your country, you may have the
                  right to request access to the personal information we collect
                  from you, change that information, or delete it. To request to
                  review, update, or delete your personal information, please
                  email us at:{' '}
                  <Link
                     href='mailto:janengo.work@gmail.com'
                     color='accent.secondary'
                     fontWeight='semibold'
                  >
                     janengo.work@gmail.com
                  </Link>
                  .
               </Text>
            </Box>
         </VStack>
      </Container>
   )
})

RemainingSection.displayName = 'RemainingSection'

// =============================================================================
// MAIN COMPONENT
// =============================================================================

/**
 * Terms page component
 */
const Terms = React.memo(({ isAuthenticated }) => {
   // Scroll to top when component mounts
   useEffect(() => {
      window.scrollTo(0, 0)
   }, [])

   return (
      <Box minH='100vh' bg='bg.surface'>
         <LandingHeader isAuthenticated={isAuthenticated} />
         <TermsHero />
         <Box py={8}>
            <IntroSection />
            <Divider />
            <SummarySection />
            <Divider />
            <TableOfContents />
            <Divider />
            <InfoCollectionSection />
            <Divider />
            <InfoUseSection />
            <Divider />
            <InfoSharingSection />
            <Divider />
            <RemainingSection />
         </Box>
         <Footer />
      </Box>
   )
})

// =============================================================================
// COMPONENT CONFIGURATION
// =============================================================================

Terms.displayName = 'Terms'

// PropTypes validation
Terms.propTypes = {
   isAuthenticated: PropTypes.bool
}

// =============================================================================
// REDUX SELECTORS
// =============================================================================

// Memoized selectors for better Redux performance
const selectAuthState = createSelector(
   [(state) => state.auth?.isAuthenticated || false],
   (isAuthenticated) => isAuthenticated
)

// =============================================================================
// REDUX CONNECTION
// =============================================================================

const mapStateToProps = (state) => ({
   isAuthenticated: selectAuthState(state)
})

const mapDispatchToProps = {
   // Add action creators if needed
}

// =============================================================================
// EXPORT
// =============================================================================

export default connect(mapStateToProps, mapDispatchToProps)(Terms)
