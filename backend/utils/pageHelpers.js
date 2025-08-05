const Page = require('../models/PageModel')

/**
 * Validate page ownership
 * @param {string} pageId - Page ID to validate
 * @param {string} userId - User ID to check ownership
 * @returns {Object|null} Page object if valid, null if invalid/unauthorized
 */
async function validatePage(pageId, userId) {
   const page = await Page.findById(pageId)
   if (!page || page.user.toString() !== userId) return null
   return page
}

module.exports = {
   validatePage
}
