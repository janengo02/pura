/**
 * Moves a task from one position/space to another in a drag-and-drop interface
 * @param {Object} params - The parameters object
 * @param {Array} params.tasks - Array of all tasks
 * @param {Array} params.task_map - Array mapping spaces to task counts/indices
 * @param {Object} params.destination - Destination drop location {droppableId, index}
 * @param {Object} params.source - Source drag location {droppableId, index}
 * @param {string} params.draggableId - ID of the dragged task
 * @returns {Object} Updated tasks and task_map arrays
 */
function moveTask({ tasks, task_map, destination, source, draggableId }) {
   const newTasks = [...tasks]
   const newTaskMap = [...task_map]

   // Invalid drag-and-drop data
   if (!destination || !source || !draggableId) {
      return { tasks: newTasks, task_map: newTaskMap }
   }
   // No change in position
   if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
   ) {
      return { tasks: newTasks, task_map: newTaskMap }
   }

   const startSpace = Number(source.droppableId)
   const endSpace = Number(destination.droppableId)
   const taskId = Number(draggableId)

   const targetTask = tasks[taskId]

   // Calculate new position in tasks array
   let newTaskIndex = destination.index
   if (endSpace !== 0) {
      newTaskIndex += task_map[endSpace - 1]
   }
   if (endSpace > startSpace) {
      newTaskIndex--
   }

   // Move the task in the array
   newTasks.splice(taskId, 1)
   newTasks.splice(newTaskIndex, 0, targetTask)

   // Update task map counts based on cross-space movement
   if (endSpace < startSpace) {
      // Moving to earlier space - increment counts for spaces in between
      for (let i = endSpace; i < startSpace; i++) {
         newTaskMap[i]++
      }
   } else if (endSpace > startSpace) {
      // Moving to later space - decrement counts for spaces in between
      for (let i = startSpace; i < endSpace; i++) {
         newTaskMap[i]--
      }
   }

   return {
      tasks: newTasks,
      task_map: newTaskMap
   }
}

function addGroup({ tasks, task_map, group_order, progress_order, newGroup }) {
   const newTaskMap = [...task_map]
   const taskCount = tasks.length
   for (let i = 1; i <= progress_order.length; i++) {
      newTaskMap.push(taskCount)
   }
   const newGroupOrder = [...group_order]
   newGroupOrder.push(newGroup)
   return { group_order: newGroupOrder, task_map: newTaskMap }
}

function deleteGroup({
   group_id,
   progress_order,
   group_order,
   tasks,
   task_map
}) {
   const originalTaskMap = [...task_map]
   const newTaskMap = [...task_map]
   const newTasks = [...tasks]
   const newGroupOrder = [...group_order]

   const groupIndex = group_order.findIndex((g) =>
      typeof g === 'object' && g !== null ? g._id === group_id : g === group_id
   )
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

   console.log(newGroupOrder, newTasks, newTaskMap)
   return { group_order: newGroupOrder, tasks: newTasks, task_map: newTaskMap }
}

module.exports = {
   moveTask,
   addGroup,
   deleteGroup
}
