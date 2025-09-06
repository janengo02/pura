/**
 * Frontend environment variable validation using Yup
 */
import * as yup from 'yup'

// Define validation schema for frontend environment variables
const envSchema = yup.object({
  REACT_APP_GOOGLE_OAUTH_CLIENT_ID: yup
    .string()
    .required('REACT_APP_GOOGLE_OAUTH_CLIENT_ID is required for Google authentication')
    .min(10, 'REACT_APP_GOOGLE_OAUTH_CLIENT_ID must be at least 10 characters'),

  REACT_APP_API_URL: yup
    .string()
    .required()
    .test('is-url', 'REACT_APP_API_URL must be a valid URL', (value) => {
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    })
}).noUnknown()

/**
 * Validate environment variables using Yup schema
 */
const validateEnv = () => {
  // Skip validation if we're already on the error page to prevent infinite loops
  if (typeof window !== 'undefined' && window.location.pathname === '/error') {
    return {
      REACT_APP_GOOGLE_OAUTH_CLIENT_ID: 'invalid',
      REACT_APP_API_URL: 'http://localhost:2000'
    }
  }

  // Prepare environment variables with defaults
  const envVars = {
    REACT_APP_GOOGLE_OAUTH_CLIENT_ID: process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID,
    REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:2000'
  }

  try {
    return envSchema.validateSync(envVars, {
      abortEarly: false,
      stripUnknown: true
    })
  } catch (error) {
    // Return default values to prevent crashes while navigating
    return {
      REACT_APP_GOOGLE_OAUTH_CLIENT_ID: 'invalid',
      REACT_APP_API_URL: 'http://localhost:2000'
    }
  }
}

// Validate environment variables
const env = validateEnv()

// Export individual variables for backward compatibility
export const googleAuthClientId = env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID
export const apiUrl = env.REACT_APP_API_URL

// Export all validated environment variables
export default env
