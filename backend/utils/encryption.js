const crypto = require('crypto')
const dotenv = require('dotenv')

dotenv.config()

const algorithm = 'aes-256-cbc'

/**
 * Get encryption key from environment variable
 * @returns {Buffer} Encryption key
 */
const getEncryptionKey = () => {
   const key = process.env.ENCRYPTION_KEY
   if (!key) {
      throw new Error('ENCRYPTION_KEY environment variable is required')
   }
   
   // Ensure key is 32 bytes for AES-256
   return crypto.createHash('sha256').update(key).digest()
}

/**
 * Encrypt sensitive data using AES-256-CBC
 * @param {string} text - Text to encrypt
 * @returns {string} Encrypted text in format: iv:encryptedData
 */
const encrypt = (text) => {
   if (!text) return text
   
   try {
      const key = getEncryptionKey()
      const iv = crypto.randomBytes(16) // 16 bytes IV for CBC
      const cipher = crypto.createCipheriv(algorithm, key, iv)
      
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')
      
      // Return iv:encryptedData format
      return `${iv.toString('hex')}:${encrypted}`
   } catch (error) {
      console.error('Encryption error:', error)
      throw new Error('Failed to encrypt data')
   }
}

/**
 * Decrypt sensitive data using AES-256-CBC
 * @param {string} encryptedText - Encrypted text in format: iv:encryptedData
 * @returns {string} Decrypted text
 */
const decrypt = (encryptedText) => {
   if (!encryptedText) return encryptedText
   
   try {
      const key = getEncryptionKey()
      const [ivHex, encrypted] = encryptedText.split(':')
      
      if (!ivHex || !encrypted) {
         throw new Error('Invalid encrypted data format')
      }
      
      const iv = Buffer.from(ivHex, 'hex')
      
      const decipher = crypto.createDecipheriv(algorithm, key, iv)
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8')
      decrypted += decipher.final('utf8')
      
      return decrypted
   } catch (error) {
      console.error('Decryption error:', error)
      throw new Error('Failed to decrypt data')
   }
}

/**
 * Check if data appears to be encrypted (contains colons and hex format)
 * @param {string} data - Data to check
 * @returns {boolean} True if data appears encrypted
 */
const isEncrypted = (data) => {
   if (!data || typeof data !== 'string') return false
   
   const parts = data.split(':')
   if (parts.length !== 2) return false
   
   // Check if all parts are valid hex
   return parts.every(part => /^[0-9a-fA-F]+$/.test(part))
}

module.exports = {
   encrypt,
   decrypt,
   isEncrypted
}