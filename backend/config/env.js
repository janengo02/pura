const dotenv = require('dotenv')
const yup = require('yup')
const logger = require('../utils/logger')

// Load environment variables from .env file
dotenv.config()

// Define validation schema for all environment variables using Yup
const envSchema = yup.object({
  NODE_ENV: yup
    .string()
    .oneOf(['development', 'production', 'test'], 'NODE_ENV must be one of: development, production, test')
    .default('development'),

  PORT: yup
    .number()
    .integer('PORT must be an integer')
    .min(1, 'PORT must be at least 1')
    .max(65535, 'PORT must be no more than 65535')
    .default(2000)
    .transform((value, originalValue) => {
      // Convert string to number if it's a valid number string
      if (typeof originalValue === 'string') {
        const parsed = parseInt(originalValue, 10)
        return isNaN(parsed) ? originalValue : parsed
      }
      return value
    }),

  DATABASE_URI: yup
    .string()
    .required('DATABASE_URI is required')
    .test('is-mongo-uri', 'DATABASE_URI must be a valid MongoDB URI (mongodb:// or mongodb+srv://)',
      value => value && (value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'))
    ),

  JWT_SECRET: yup
    .string()
    .required('JWT_SECRET is required for authentication')
    .min(32, 'JWT_SECRET must be at least 32 characters for security'),

  ENCRYPTION_KEY: yup
    .string()
    .required('ENCRYPTION_KEY is required for encrypting tokens')
    .min(32, 'ENCRYPTION_KEY must be at least 32 characters for security'),

  GOOGLE_CLIENT_ID: yup
    .string()
    .required('GOOGLE_CLIENT_ID is required for Google OAuth')
    .min(10, 'GOOGLE_CLIENT_ID must be at least 10 characters'),

  GOOGLE_CLIENT_SECRET: yup
    .string()
    .required('GOOGLE_CLIENT_SECRET is required for Google OAuth')
    .min(10, 'GOOGLE_CLIENT_SECRET must be at least 10 characters'),

  FRONTEND_URL: yup
    .string()
    .required('FRONTEND_URL is required for CORS configuration')
    .test('is-url', 'FRONTEND_URL must be a valid URL', (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    })
}).noUnknown()

// Validate and export environment variables
let env
try {
  // Prepare environment variables for validation
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 2000,
    DATABASE_URI: process.env.DATABASE_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    FRONTEND_URL: process.env.FRONTEND_URL
  }

  env = envSchema.validateSync(envVars, {
    abortEarly: false,
    stripUnknown: true
  })
} catch (error) {
  const errorMessage = [
    '❌ Backend environment variable validation failed:',
    ...(error.inner || [error]).map(err => `  • ${err.message}`),
    '',
    '💡 Check your .env file and ensure all required variables are set correctly.'
  ].join('\n')

  logger.error(
    'Failed to validate environment variables',
    {
      database: 'env',
      operation: 'validate'
    },
    new Error(errorMessage)
  )
}

module.exports = env