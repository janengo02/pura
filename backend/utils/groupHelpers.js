const prisma = require('../config/prisma')

/**
 * Validate group exists
 * @param {string} groupId - Group ID to validate
 * @returns {Object|null} Group object if exists, null if not found
 */
const validateGroup = async (groupId) => {
   const group = await prisma.group.findUnique({ where: { id: groupId } })
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
const prepareGroupData = ({ title, color }) => {
   const newGroup = {}
   if (title) newGroup.title = title
   if (color) newGroup.color = color
   return newGroup
}

const createGroup = ({
   tasks,
   taskMap,
   groupOrder,
   progressOrder,
   newGroup
}) => {
   const newTaskMap = [...taskMap]
   const taskCount = tasks.length
   for (let i = 1; i <= progressOrder.length; i++) {
      newTaskMap.push(taskCount)
   }
   const newGroupOrder = [...groupOrder]
   newGroupOrder.push(newGroup)
   return { groupOrder: newGroupOrder, taskMap: newTaskMap }
}

const deleteGroup = ({
   groupIndex,
   progressOrder,
   groupOrder,
   tasks,
   taskMap
}) => {
   const originalTaskMap = [...taskMap]
   const newTaskMap = [...taskMap]
   const newTasks = [...tasks]
   const newGroupOrder = [...groupOrder]

   if (groupIndex === -1) {
      return {
         groupOrder: newGroupOrder,
         tasks: newTasks,
         taskMap: newTaskMap
      }
   }
   const progressCount = progressOrder.length
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

   const newTaskStart = mapStart === 0 ? 0 : originalTaskMap[mapStart - 1]
   const newTaskEnd = originalTaskMap[mapEnd] - 1
   newTasks.splice(newTaskStart, newTaskEnd - newTaskStart + 1)

   return { groupOrder: newGroupOrder, tasks: newTasks, taskMap: newTaskMap }
}

module.exports = {
   validateGroup,
   prepareGroupData,
   createGroup,
   deleteGroup
}
