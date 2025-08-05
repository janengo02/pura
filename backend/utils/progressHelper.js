const Progress = require('../models/ProgressModel')

/**
 * Validate progress exists
 * @param {string} progressId - Progress ID to validate
 * @returns {Object|null} Progress object if exists, null if not found
 */
async function validateProgress(progressId) {
   const progress = await Progress.findById(progressId)
   if (!progress) return null
   return progress
}

/**
 * Prepare progress data object from request body
 * @param {Object} body - Request body data
 * @param {string} [body.title] - Progress title
 * @param {string} [body.title_color] - Progress title color
 * @param {string} [body.color] - Progress background color
 * @returns {Object} Prepared progress data object
 */
function prepareProgressData(body) {
   const { title, title_color, color } = body
   const data = {}
   if (title) data.title = title
   if (title_color) data.title_color = title_color
   if (color) data.color = color
   return data
}

module.exports = {
   validateProgress,
   prepareProgressData
}
