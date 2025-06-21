const Page = require('../models/PageModel')
const Group = require('../models/GroupModel')

async function validateGroup(groupId) {
   const group = await Group.findById(groupId)
   if (!group) return null
   return group
}

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
