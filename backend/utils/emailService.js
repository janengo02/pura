const dotenv = require('dotenv')
const https = require('https')
const logger = require('./logger')

dotenv.config()

/**
 * Email service utility
 */
class EmailService {
   constructor() {
      const hasWebhook = process.env.NOTIFICATION_WEBHOOK_URL
      logger.info(`Email service initialized with ${hasWebhook ? 'webhook + logging' : 'logging only'} approach`)
   }

   /**
    * Send notification for Google Calendar test access request
    * @param {string} userEmail - Email address of the user requesting access
    * @returns {Promise<boolean>} Success status
    */
   async sendTestUserRequestEmail(userEmail) {
      if (!process.env.NOTIFICATION_WEBHOOK_URL) {
         logger.error('NOTIFICATION_WEBHOOK_URL not configured - cannot send notification')
         throw new Error('Webhook URL not configured')
      }

      // Send webhook notification
      try {
         await this.sendWebhookNotification(userEmail)
         logger.info(`Webhook notification sent successfully for ${userEmail}`)
      } catch (error) {
         logger.error(`Webhook notification failed for ${userEmail}:`, error.message)
         throw new Error('Failed to send webhook notification')
      }

      // Always log for backup/audit trail
      logger.info('🗓️ PURA GOOGLE CALENDAR TEST ACCESS REQUEST', {
         userEmail: userEmail,
         timestamp: new Date().toISOString(),
         requestType: 'google_calendar_test_access',
         action: 'WEBHOOK_SENT',
         instructions: [
            '1. Go to Google Cloud Console',
            '2. Navigate to APIs & Services → Credentials',
            '3. Edit your OAuth 2.0 Client',
            '4. Add this email to Test Users list',
            `5. Email to add: ${userEmail}`
         ]
      })

      return true
   }

   /**
    * Send webhook notification (Discord, Slack, etc.)
    * @param {string} userEmail - User's email address
    * @returns {Promise<boolean>} Success status
    */
   async sendWebhookNotification(userEmail) {
      const webhookUrl = process.env.NOTIFICATION_WEBHOOK_URL

      // Discord/Slack webhook format
      const payload = {
         content: `🗓️ **PURA Google Calendar Test Access Request**\n\n📧 **Email:** \`${userEmail}\`\n📅 **Date:** ${new Date().toLocaleString()}\n\n⚠️ **Action Required:**\n1. Go to Google Cloud Console\n2. Navigate to APIs & Services → Credentials\n3. Edit your OAuth 2.0 Client\n4. Add \`${userEmail}\` to Test Users list`,
         embeds: [{
            title: "Test Access Request Details",
            color: 0x6B46C1, // Purple color
            fields: [
               { name: "User Email", value: userEmail, inline: true },
               { name: "Timestamp", value: new Date().toISOString(), inline: false }
            ],
            footer: { text: "PURA Timeboxing Tool" }
         }]
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
               'Content-Length': Buffer.byteLength(postData),
               'User-Agent': 'Pura-Task-Manager/1.0'
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
                  resolve(true)
               } else {
                  reject(new Error(`Webhook returned status ${res.statusCode}: ${responseBody}`))
               }
            })
         })

         req.on('error', (error) => {
            reject(new Error(`Webhook request failed: ${error.message}`))
         })

         req.on('timeout', () => {
            req.destroy()
            reject(new Error('Webhook request timed out'))
         })

         req.write(postData)
         req.end()
      })
   }
}

// Create singleton instance
const emailService = new EmailService()

module.exports = emailService