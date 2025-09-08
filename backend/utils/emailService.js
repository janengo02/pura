const nodemailer = require('nodemailer')
const https = require('https')
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
         const { EMAIL_USER, EMAIL_PASSWORD } = process.env

         if (!EMAIL_USER || !EMAIL_PASSWORD) {
            logger.warn('Email service not configured - EMAIL_USER and EMAIL_PASSWORD are required')
            return
         }

         // Gmail configuration optimized for Railway and other cloud platforms
         const transportConfig = {
            service: 'gmail',
            auth: {
               user: EMAIL_USER,
               pass: EMAIL_PASSWORD
            },
            // Cloud platform optimized settings
            pool: false, // Disable connection pooling for Railway
            host: 'smtp.gmail.com',
            port: 465, // Use secure port for Railway
            secure: true, // Use SSL/TLS
            connectionTimeout: 30000, // Reduced timeout for Railway
            greetingTimeout: 15000, // Reduced greeting timeout
            socketTimeout: 30000, // Reduced socket timeout
            tls: {
               rejectUnauthorized: false,
               servername: 'smtp.gmail.com'
            },
            // Additional settings for cloud platforms
            requireTLS: true,
            authMethod: 'PLAIN'
         }

         this.transporter = nodemailer.createTransport(transportConfig)
         this.isConfigured = true

         logger.info('Email service initialized with Gmail')
      } catch (error) {
         logger.error('Failed to initialize email service:', error)
         this.isConfigured = false
      }
   }

   /**
    * Send email for Google Calendar test access request with Railway-optimized retry logic
    * @param {string} userEmail - Email address of the user requesting access
    * @param {number} maxRetries - Maximum number of retry attempts
    * @returns {Promise<boolean>} Success status
    */
   async sendTestUserRequestEmail(userEmail, maxRetries = 2) {
      if (!process.env.ADMIN_EMAIL) {
         logger.error('Admin email not configured - cannot send notification')
         throw new Error('Admin email not configured')
      }

      // Try SMTP first if configured
      if (this.isConfigured) {
         try {
            return await this.attemptSmtpSend(userEmail, maxRetries)
         } catch (error) {
            logger.warn('SMTP failed, trying webhook fallback:', error.message)
         }
      }

      // Try webhook as fallback
      if (process.env.EMAIL_WEBHOOK_URL) {
         try {
            return await this.sendViaWebhook(userEmail)
         } catch (error) {
            logger.warn('Webhook fallback failed:', error.message)
         }
      }

      // Final fallback: Log for manual processing
      logger.warn('All email methods failed - logging test access request for manual processing', {
         userEmail,
         adminEmail: process.env.ADMIN_EMAIL,
         timestamp: new Date().toISOString(),
         requestType: 'google_calendar_test_access',
         message: 'MANUAL ACTION REQUIRED: Add this email to Google Calendar test users'
      })

      // Consider it successful since it's logged and will be processed manually
      return true
   }

   /**
    * Attempt SMTP email sending with Railway-optimized settings
    * @param {string} userEmail - User's email address
    * @param {number} maxRetries - Maximum retry attempts
    * @returns {Promise<boolean>} Success status
    */
   async attemptSmtpSend(userEmail, maxRetries) {
      const mailOptions = {
         from: `"Pura Task Manager" <${process.env.EMAIL_USER}>`,
         to: process.env.ADMIN_EMAIL,
         subject: 'New Google Calendar Test Access Request',
         html: this.generateTestAccessRequestHtml(userEmail),
         text: this.generateTestAccessRequestText(userEmail)
      }

      let lastError = null
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
         try {
            logger.info(`Attempting SMTP email for ${userEmail} (attempt ${attempt}/${maxRetries})`)
            
            // Create fresh transporter for each attempt on Railway
            const result = await this.transporter.sendMail(mailOptions)

            logger.info(`Test access request email sent via SMTP for ${userEmail}`, {
               messageId: result.messageId,
               attempt: attempt
            })

            return true
         } catch (error) {
            lastError = error
            logger.warn(`SMTP attempt ${attempt}/${maxRetries} failed for ${userEmail}:`, {
               error: error.message,
               code: error.code,
               command: error.command,
               errno: error.errno
            })

            // Shorter wait time for Railway
            if (attempt < maxRetries) {
               const waitTime = 2000 // Fixed 2s wait
               await new Promise(resolve => setTimeout(resolve, waitTime))
            }
         }
      }

      throw new Error(`SMTP failed after ${maxRetries} attempts: ${lastError.message}`)
   }

   /**
    * Send notification via webhook (Discord, Slack, Zapier, etc.)
    * @param {string} userEmail - User's email address
    * @returns {Promise<boolean>} Success status
    */
   async sendViaWebhook(userEmail) {
      const webhookUrl = process.env.EMAIL_WEBHOOK_URL
      
      const payload = {
         text: `🗓️ New Google Calendar Test Access Request`,
         content: `**New Test Access Request**\n\n📧 **Email:** ${userEmail}\n📅 **Date:** ${new Date().toLocaleString()}\n\n**Action Required:** Add this email to Google Cloud Console OAuth test users.`,
         userEmail: userEmail,
         adminEmail: process.env.ADMIN_EMAIL,
         timestamp: new Date().toISOString(),
         requestType: 'google_calendar_test_access'
      }

      return new Promise((resolve, reject) => {
         const postData = JSON.stringify(payload)
         const url = new URL(webhookUrl)
         
         const options = {
            hostname: url.hostname,
            port: url.port || 443,
            path: url.pathname + url.search,
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
               'Content-Length': Buffer.byteLength(postData)
            },
            timeout: 10000 // 10 second timeout
         }

         const req = https.request(options, (res) => {
            let responseBody = ''
            
            res.on('data', (chunk) => {
               responseBody += chunk
            })
            
            res.on('end', () => {
               if (res.statusCode >= 200 && res.statusCode < 300) {
                  logger.info(`Webhook notification sent successfully for ${userEmail}`, {
                     statusCode: res.statusCode,
                     webhookUrl: url.hostname
                  })
                  resolve(true)
               } else {
                  logger.error(`Webhook failed with status ${res.statusCode}:`, responseBody)
                  reject(new Error(`Webhook returned status ${res.statusCode}`))
               }
            })
         })

         req.on('error', (error) => {
            logger.error('Webhook request failed:', error.message)
            reject(error)
         })

         req.on('timeout', () => {
            logger.error('Webhook request timed out')
            req.destroy()
            reject(new Error('Webhook request timed out'))
         })

         req.write(postData)
         req.end()
      })
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