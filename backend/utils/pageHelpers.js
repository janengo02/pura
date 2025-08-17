const prisma = require('../config/prisma')

/**
 * Validate page ownership
 * @param {string} pageId - Page ID to validate
 * @param {string} userId - User ID to check ownership
 * @returns {Object|null} Page object if valid, null if invalid/unauthorized
 */
async function validatePage(pageId, userId) {
   const page = await prisma.page.findUnique({ where: { id: pageId } })
   if (!page || page.userId !== userId) return null
   return page
}

/**
 * Helper function to populate page with related data (like Mongoose .populate())
 */
async function populatePage(page) {
   if (!page) return page

   const [tasksData, progressData, groupData] = await Promise.all([
      prisma.task.findMany({
         where: { id: { in: page.tasks } },
         select: { id: true, title: true, schedule: true, content: true }
      }),
      prisma.progress.findMany({
         where: { id: { in: page.progressOrder } },
         select: {
            id: true,
            title: true,
            titleColor: true,
            color: true,
            visibility: true
         }
      }),
      prisma.group.findMany({
         where: { id: { in: page.groupOrder } },
         select: { id: true, title: true, color: true, visibility: true }
      })
   ])

   // Create a map for quick lookup
   const taskMap = tasksData.reduce((map, task) => {
      map[task.id] = task
      return map
   }, {})
   
   // Sort tasks to match the order in page.tasks
   const tasks = page.tasks.map(taskId => taskMap[taskId]).filter(Boolean)

   // Sort progressOrder and groupOrder to match their respective arrays
   const progressMap = progressData.reduce((map, progress) => {
      map[progress.id] = progress
      return map
   }, {})
   const progressOrder = page.progressOrder.map(progressId => progressMap[progressId]).filter(Boolean)

   const groupMap = groupData.reduce((map, group) => {
      map[group.id] = group
      return map
   }, {})
   const groupOrder = page.groupOrder.map(groupId => groupMap[groupId]).filter(Boolean)

   return {
      ...page,
      tasks,
      progressOrder,
      groupOrder
   }
}

/**
 * Moves a task from one position/space to another in a drag-and-drop interface
 * @param {Object} params - The parameters object
 * @param {Array} params.tasks - Array of all tasks
 * @param {Array} params.taskMap - Array mapping spaces to task counts/indices
 * @param {Object} params.destination - Destination drop location {droppableId, index}
 * @param {Object} params.source - Source drag location {droppableId, index}
 * @param {string} params.draggableId - ID of the dragged task
 * @returns {Object} Updated tasks and taskMap arrays
 */
const moveTask = ({ tasks, taskMap, destination, source, draggableId }) => {
   const newTasks = [...tasks]
   const newTaskMap = [...taskMap]

   // Invalid drag-and-drop data
   if (!destination || !source || !draggableId) {
      return { tasks: newTasks, taskMap: newTaskMap }
   }
   // No change in position
   if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
   ) {
      return { tasks: newTasks, taskMap: newTaskMap }
   }

   const startSpace = Number(source.droppableId)
   const endSpace = Number(destination.droppableId)
   const taskId = Number(draggableId)

   const targetTask = tasks[taskId]

   // Calculate new position in tasks array
   let newTaskIndex = destination.index
   if (endSpace !== 0) {
      newTaskIndex += taskMap[endSpace - 1]
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
      taskMap: newTaskMap
   }
}

module.exports = {
   validatePage,
   populatePage,
   moveTask
}
