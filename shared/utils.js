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

function createGroup({
   tasks,
   task_map,
   group_order,
   progress_order,
   newGroup
}) {
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
   groupIndex,
   progress_order,
   group_order,
   tasks,
   task_map
}) {
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

function createProgress({
   progress_order,
   group_order,
   task_map,
   newProgress
}) {
   var newTaskMap = [...task_map]
   if (group_order.length > 0) {
      const n_group = group_order.length
      const m_progress = progress_order.length + 1
      for (let i = 1; i <= n_group; i++) {
         const task_count = newTaskMap[i * m_progress - 2]
         newTaskMap.splice(i * m_progress - 1, 0, task_count)
      }
   }
   const newProgressOrder = [...progress_order]
   newProgressOrder.push(newProgress)
   return { progress_order: newProgressOrder, task_map: newTaskMap }
}

function deleteProgress({
   progressIndex,
   progress_order,
   group_order,
   tasks,
   task_map
}) {
   if (progressIndex === -1) {
      return {
         progress_order: [...progress_order],
         tasks: [...tasks],
         task_map: [...task_map]
      }
   }

   const groupCount = group_order.length
   const progressCount = progress_order.length
   const newTasks = []
   const newTaskMap = []
   let deletedCount = 0

   for (let i = 0; i < groupCount; i++) {
      for (let j = 0; j < progressCount; j++) {
         const mapIdx = i * progressCount + j
         const currMapCount = task_map[mapIdx]
         const prevMapCount = mapIdx === 0 ? 0 : task_map[mapIdx - 1]
         if (j === progressIndex) {
            deletedCount += currMapCount - prevMapCount
         } else {
            const newMapCount = currMapCount - deletedCount
            newTaskMap.push(newMapCount)
            for (let t = prevMapCount; t < currMapCount; t++) {
               newTasks.push(tasks[t])
            }
         }
      }
   }

   const newProgressOrder = [...progress_order]
   newProgressOrder.splice(progressIndex, 1)
   return {
      progress_order: newProgressOrder,
      tasks: newTasks,
      task_map: newTaskMap
   }
}

function createTask({
   new_task_info,
   group_order,
   progress_order,
   task_map,
   tasks
}) {
   const { group_id, progress_id, newTask } = new_task_info

   const progressIndex = progress_order.findIndex((p) => p._id === progress_id)
   const groupIndex = group_order.findIndex((g) => g._id === group_id)
   if (progressIndex === -1 || groupIndex === -1) {
      return { tasks: [...tasks], task_map: [...task_map] }
   }

   const progressCount = progress_order.length
   const taskMapIndex = groupIndex * progressCount + progressIndex

   const newTaskMap = [...task_map]
   for (let i = taskMapIndex; i < newTaskMap.length; i++) {
      newTaskMap[i]++
   }

   const insertIndex = newTaskMap[taskMapIndex] - 1
   const newTasks = [...tasks]
   newTasks.splice(insertIndex, 0, newTask)

   return {
      tasks: newTasks,
      task_map: newTaskMap
   }
}

function deleteTask({ task_id, task_map, tasks }) {
   const taskIndex = tasks.findIndex((t) => t._id === task_id)
   if (taskIndex === -1) {
      return { tasks: [...tasks], task_map: [...task_map] }
   }

   const newTasks = [...tasks]
   newTasks.splice(taskIndex, 1)

   const newTaskMap = [...task_map]
   for (let i = 0; i < newTaskMap.length; i++) {
      if (newTaskMap[i] > taskIndex) newTaskMap[i]--
   }

   return { tasks: newTasks, task_map: newTaskMap }
}

export {
   moveTask,
   createGroup,
   deleteGroup,
   createProgress,
   deleteProgress,
   createTask,
   deleteTask
}
