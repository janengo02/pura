const Page = require('../models/PageModel')
const Group = require('../models/GroupModel')
const { validatePage } = require('./pageHelpers') // Updated import

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

function updateTaskMapForGroup(page, groupId = null) {
   const newTaskMap = [...page.task_map]
   const newTasks = [...page.tasks]
   const newGroupOrder = [...page.group_order]

   if (groupId) {
      // Remove an existing group
      const groupIndex = page.group_order.indexOf(groupId)
      const progressCount = page.progress_order.length
      const mapStart = progressCount * groupIndex
      const mapEnd = mapStart + progressCount - 1

      const taskCount =
         mapStart === 0
            ? newTaskMap[mapEnd]
            : newTaskMap[mapEnd] - newTaskMap[mapStart - 1]
      for (let i = mapEnd + 1; i < newTaskMap.length; i++) {
         newTaskMap[i] -= taskCount
      }
      newTaskMap.splice(mapStart, mapEnd - mapStart + 1)
      newGroupOrder.splice(groupIndex, 1)

      const newTaskStart = mapStart === 0 ? 0 : newTaskMap[mapStart - 1]
      const newTaskEnd = newTaskMap[mapEnd] - 1
      newTasks.splice(newTaskStart, newTaskEnd - newTaskStart + 1)
   } else {
      // Create a new group
      const taskCount = page.tasks.length
      for (let i = 1; i <= page.progress_order.length; i++) {
         newTaskMap.push(taskCount)
      }
   }

   return { newTaskMap, newTasks, newGroupOrder }
}

module.exports = {
   validateGroup,
   prepareGroupData,
   updateTaskMapForGroup
}
