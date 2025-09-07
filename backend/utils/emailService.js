const nodemailer = require('nodemailer')
const dotenv = require('dotenv')
const logger = require('./logger')

dotenv.config()

/**
 * Email service utility for sending emails
 * Supports multiple email providers through nodemailer
 */
class EmailService {
   constructor() {
      this.transporter = null
      this.isConfigured = false
      this.initializeTransporter()
   }

   /**
    * Initialize the email transporter based on environment configuration
    */
   initializeTransporter() {
      try {
         const { EMAIL_SERVICE, EMAIL_USER, EMAIL_PASSWORD } = process.env

         if (!EMAIL_SERVICE || !EMAIL_USER || !EMAIL_PASSWORD) {
            logger.warn('Email service not fully configured - some environment variables are missing')
            return
         }

         // Create transporter configuration based on service
         const transportConfig = {
            service: 'gmail',
            auth: {
               user: EMAIL_USER,
               pass: EMAIL_PASSWORD
            }
         }

         this.transporter = nodemailer.createTransport(transportConfig)
         this.isConfigured = true

         logger.info(`Email service initialized with ${EMAIL_SERVICE}`)
      } catch (error) {
         logger.error('Failed to initialize email service:', error)
         this.isConfigured = false
      }
   }

   /**
    * Send email for Google Calendar test access request
    * @param {string} userEmail - Email address of the user requesting access
    * @returns {Promise<boolean>} Success status
    */
   async sendTestUserRequestEmail(userEmail) {
      if (!this.isConfigured) {
         logger.error('Email service not configured - cannot send email')
         throw new Error('Email service not configured')
      }

      if (!process.env.ADMIN_EMAIL) {
         logger.error('Admin email not configured - cannot send notification')
         throw new Error('Admin email not configured')
      }

      try {
         const mailOptions = {
            from: `"Pura Task Manager" <${process.env.EMAIL_USER}>`,
            to: process.env.ADMIN_EMAIL,
            subject: 'New Google Calendar Test Access Request',
            html: this.generateTestAccessRequestHtml(userEmail),
            text: this.generateTestAccessRequestText(userEmail)
         }

         const result = await this.transporter.sendMail(mailOptions)

         logger.info(`Test access request email sent successfully for ${userEmail}`, {
            messageId: result.messageId,
            recipientEmail: userEmail
         })

         return true
      } catch (error) {
         logger.error(`Failed to send test access request email for ${userEmail}:`, error)
         throw new Error('Failed to send email notification')
      }
   }

   /**
    * Generate HTML email template for test access request
    * @param {string} userEmail - User's email address
    * @returns {string} HTML email content
    */
   generateTestAccessRequestHtml(userEmail) {
      const currentDate = new Date().toLocaleString()

      return `
         <!DOCTYPE html>
         <html>
         <head>
            <meta charset="utf-8">
            <title>New Test Access Request</title>
            <style>
               body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
               .container { max-width: 600px; margin: 0 auto; padding: 20px; }
               .header { background: #6B46C1; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
               .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
               .highlight { background: #e0e7ff; padding: 15px; border-radius: 6px; margin: 15px 0; }
               .footer { margin-top: 20px; font-size: 12px; color: #666; }
            </style>
         </head>
         <body>
            <div class="container">
               <div class="header">
                  <h1>🗓️ New Google Calendar Test Access Request</h1>
               </div>
               <div class="content">
                  <p>Hello Admin,</p>

                  <p>A new user has requested access to the Google Calendar integration feature in Pura Task Manager.</p>

                  <div class="highlight">
                     <strong>User Details:</strong><br>
                     📧 Email: <strong>${userEmail}</strong><br>
                     📅 Request Date: <strong>${currentDate}</strong>
                  </div>

                  <p>The user is interested in testing the Google Calendar integration feature. Please consider adding their email address to the test user list for Google OAuth access.</p>

                  <p><strong>Next Steps:</strong></p>
                  <ul>
                     <li>Add the user's email to your Google Cloud Console OAuth test users</li>
                     <li>Verify the user's identity if needed</li>
                     <li>Consider reaching out to provide setup instructions</li>
                  </ul>

                  <div class="footer">
                     <p>This notification was sent automatically by Pura Task Manager.<br>
                     Please do not reply to this email.</p>
                  </div>
               </div>
            </div>
         </body>
         </html>
      `
   }

   /**
    * Generate plain text email template for test access request
    * @param {string} userEmail - User's email address
    * @returns {string} Plain text email content
    */
   generateTestAccessRequestText(userEmail) {
      const currentDate = new Date().toLocaleString()

      return `
         New Google Calendar Test Access Request

         Hello Admin,

         A new user has requested access to the Google Calendar integration feature in Pura Task Manager.

         User Details:
         Email: ${userEmail}
         Request Date: ${currentDate}

         The user is interested in testing the Google Calendar integration feature. Please consider adding their email address to the test user list for Google OAuth access.

         Next Steps:
         - Add the user's email to your Google Cloud Console OAuth test users
         - Verify the user's identity if needed
         - Consider reaching out to provide setup instructions

         This notification was sent automatically by Pura Task Manager.
         Please do not reply to this email.
      `.trim()
   }
}

// Create singleton instance
const emailService = new EmailService()

module.exports = emailService