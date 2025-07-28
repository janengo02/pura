const { google } = require('googleapis')
const { setOAuthCredentials } = require('./googleAccountHelper')

/**
 * Create a Google Meet space using the Meet API
 * @param {string} refreshToken - User's Google refresh token
 * @param {object} config - Meet space configuration
 * @returns {object} Meet space data
 */
const createMeetSpace = async (refreshToken, config = {}) => {
   try {
      const oauth2Client = setOAuthCredentials(refreshToken)
      const meet = google.meet('v2')

      const defaultConfig = {
         accessType: 'TRUSTED',
         entryPointAccess: 'ALL'
      }

      const spaceConfig = { ...defaultConfig, ...config }

      const meetSpace = await meet.spaces.create({
         auth: oauth2Client,
         requestBody: {
            config: spaceConfig
         }
      })

      return {
         success: true,
         data: meetSpace.data
      }
   } catch (error) {
      console.error('Error creating Meet space:', error)
      return {
         success: false,
         error: error.message,
         code: error.code
      }
   }
}

/**
 * Get Google Meet space details
 * @param {string} refreshToken - User's Google refresh token
 * @param {string} spaceId - The space ID
 * @returns {object} Meet space data
 */
const getMeetSpace = async (refreshToken, spaceId) => {
   try {
      const oauth2Client = setOAuthCredentials(refreshToken)
      const meet = google.meet('v2')

      const meetSpace = await meet.spaces.get({
         auth: oauth2Client,
         name: spaceId
      })

      return {
         success: true,
         data: meetSpace.data
      }
   } catch (error) {
      console.error('Error getting Meet space:', error)
      return {
         success: false,
         error: error.message,
         code: error.code
      }
   }
}

/**
 * Update Google Meet space configuration
 * @param {string} refreshToken - User's Google refresh token
 * @param {string} spaceId - The space ID
 * @param {object} config - Updated configuration
 * @returns {object} Updated Meet space data
 */
const updateMeetSpace = async (refreshToken, spaceId, config) => {
   try {
      const oauth2Client = setOAuthCredentials(refreshToken)
      const meet = google.meet('v2')

      const updateMask = []
      const requestBody = {}

      // Build update mask and request body
      if (config.accessType !== undefined) {
         updateMask.push('config.access_type')
         requestBody.config = { ...requestBody.config, accessType: config.accessType }
      }
      if (config.entryPointAccess !== undefined) {
         updateMask.push('config.entry_point_access')
         requestBody.config = { ...requestBody.config, entryPointAccess: config.entryPointAccess }
      }

      const meetSpace = await meet.spaces.patch({
         auth: oauth2Client,
         name: spaceId,
         updateMask: updateMask.join(','),
         requestBody: requestBody
      })

      return {
         success: true,
         data: meetSpace.data
      }
   } catch (error) {
      console.error('Error updating Meet space:', error)
      return {
         success: false,
         error: error.message,
         code: error.code
      }
   }
}

/**
 * End active conference in Google Meet space
 * @param {string} refreshToken - User's Google refresh token
 * @param {string} spaceId - The space ID
 * @returns {object} Result of ending conference
 */
const endMeetSpace = async (refreshToken, spaceId) => {
   try {
      const oauth2Client = setOAuthCredentials(refreshToken)
      const meet = google.meet('v2')

      await meet.spaces.endActiveConference({
         auth: oauth2Client,
         name: spaceId
      })

      return {
         success: true,
         message: 'Conference ended successfully'
      }
   } catch (error) {
      console.error('Error ending Meet space:', error)
      return {
         success: false,
         error: error.message,
         code: error.code
      }
   }
}

/**
 * Format Meet space data for API response
 * @param {object} spaceData - Raw space data from Google Meet API
 * @returns {object} Formatted space data
 */
const formatMeetSpaceData = (spaceData) => {
   return {
      meetUri: spaceData.meetingUri,
      spaceId: spaceData.name,
      meetingCode: spaceData.meetingCode,
      config: {
         accessType: spaceData.config?.accessType,
         entryPointAccess: spaceData.config?.entryPointAccess
      },
      activeConference: spaceData.activeConference ? {
         conferenceRecord: spaceData.activeConference.conferenceRecord
      } : null,
      createTime: spaceData.createTime,
      updateTime: spaceData.updateTime
   }
}

/**
 * Validate Meet space configuration
 * @param {object} config - Configuration to validate
 * @returns {object} Validation result
 */
const validateMeetConfig = (config) => {
   const validAccessTypes = ['OPEN', 'TRUSTED', 'RESTRICTED']
   const validEntryPointAccess = ['ALL', 'CREATOR_APP_ONLY']

   const errors = []

   if (config.accessType && !validAccessTypes.includes(config.accessType)) {
      errors.push(`Invalid accessType. Must be one of: ${validAccessTypes.join(', ')}`)
   }

   if (config.entryPointAccess && !validEntryPointAccess.includes(config.entryPointAccess)) {
      errors.push(`Invalid entryPointAccess. Must be one of: ${validEntryPointAccess.join(', ')}`)
   }

   return {
      isValid: errors.length === 0,
      errors
   }
}

/**
 * Handle Google Meet API errors with user-friendly messages
 * @param {object} error - Error from Google Meet API
 * @returns {object} Formatted error response
 */
const handleMeetAPIError = (error) => {
   const errorMap = {
      400: 'Invalid request. Please check your parameters.',
      401: 'Authentication failed. Please reconnect your Google account.',
      403: 'Access denied. Please ensure your Google Workspace has Meet API access.',
      404: 'Meet space not found.',
      429: 'Rate limit exceeded. Please try again later.',
      500: 'Internal server error. Please try again later.'
   }

   const userMessage = errorMap[error.code] || 'An unexpected error occurred.'

   return {
      code: error.code || 500,
      message: userMessage,
      details: error.message
   }
}

module.exports = {
   createMeetSpace,
   getMeetSpace,
   updateMeetSpace,
   endMeetSpace,
   formatMeetSpaceData,
   validateMeetConfig,
   handleMeetAPIError
}