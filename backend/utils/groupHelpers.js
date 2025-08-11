const Page = require('../models/PageModel')
const Group = require('../models/GroupModel')

/**
 * Validate group exists
 * @param {string} groupId - Group ID to validate
 * @returns {Object|null} Group object if exists, null if not found
 */
const validateGroup = async (groupId) => {
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
const prepareGroupData = ({ title, color }) => {
   const newGroup = {}
   if (title) newGroup.title = title
   if (color) newGroup.color = color
   return newGroup
}

const createGroup = ({
   tasks,
   task_map,
   group_order,
   progress_order,
   newGroup
}) => {
   const newTaskMap = [...task_map]
   const taskCount = tasks.length
   for (let i = 1; i <= progress_order.length; i++) {
      newTaskMap.push(taskCount)
   }
   const newGroupOrder = [...group_order]
   newGroupOrder.push(newGroup)
   return { group_order: newGroupOrder, task_map: newTaskMap }
}

const deleteGroup = ({
   groupIndex,
   progress_order,
   group_order,
   tasks,
   task_map
}) => {
   const originalTaskMap = [...task_map]
   const newTaskMap = [...task_map]
   const newTasks = [...tasks]
   const newGroupOrder = [...group_order]

   if (groupIndex === -1) {
      return {
         group_order: newGroupOrder,
         tasks: newTasks,
         task_map: newTaskMap
      }
   }
   const progressCount = progress_order.length
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

   return { group_order: newGroupOrder, tasks: newTasks, task_map: newTaskMap }
}

module.exports = {
   validateGroup,
   prepareGroupData,
   createGroup,
   deleteGroup
}
