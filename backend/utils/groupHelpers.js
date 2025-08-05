const Page = require('../models/PageModel')
const Group = require('../models/GroupModel')

/**
 * Validate group exists
 * @param {string} groupId - Group ID to validate
 * @returns {Object|null} Group object if exists, null if not found
 */
async function validateGroup(groupId) {
   const group = await Group.findById(groupId)
   if (!group) return null
   return group
}

/**
 * Prepare group data object from request body
 * @param {Object} data - Request body data
 * @param {string} [data.title] - Group title
 * @param {string} [data.color] - Group color
 * @returns {Object} Prepared group data object
 */
function prepareGroupData({ title, color }) {
   const newGroup = {}
   if (title) newGroup.title = title
   if (color) newGroup.color = color
   return newGroup
}

module.exports = {
   validateGroup,
   prepareGroupData
}
