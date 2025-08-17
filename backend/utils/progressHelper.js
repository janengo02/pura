const prisma = require('../config/prisma')

/**
 * Validate progress exists
 * @param {string} progressId - Progress ID to validate
 * @returns {Object|null} Progress object if exists, null if not found
 */
const validateProgress = async (progressId) => {
   const progress = await prisma.progress.findUnique({ where: { id: progressId } })
   if (!progress) return null
   return progress
}

/**
 * Prepare progress data object from request body
 * @param {Object} body - Request body data
 * @param {string} [body.title] - Progress title
 * @param {string} [body.titleColor] - Progress title color
 * @param {string} [body.color] - Progress background color
 * @returns {Object} Prepared progress data object
 */
const prepareProgressData = (body) => {
   const { title, titleColor, color } = body
   const data = {}
   if (title) data.title = title
   if (titleColor) data.titleColor = titleColor
   if (color) data.color = color
   return data
}

const createProgress = ({
   progressOrder,
   groupOrder,
   taskMap,
   newProgress
}) => {
   var newTaskMap = [...taskMap]
   if (groupOrder.length > 0) {
      const n_group = groupOrder.length
      const m_progress = progressOrder.length + 1
      for (let i = 1; i <= n_group; i++) {
         const task_count = newTaskMap[i * m_progress - 2]
         newTaskMap.splice(i * m_progress - 1, 0, task_count)
      }
   }
   const newProgressOrder = [...progressOrder]
   newProgressOrder.push(newProgress)
   return { progressOrder: newProgressOrder, taskMap: newTaskMap }
}

const deleteProgress = ({
   progressIndex,
   progressOrder,
   groupOrder,
   tasks,
   taskMap
}) => {
   if (progressIndex === -1) {
      return {
         progressOrder: [...progressOrder],
         tasks: [...tasks],
         taskMap: [...taskMap]
      }
   }

   const groupCount = groupOrder.length
   const progressCount = progressOrder.length
   const newTasks = []
   const newTaskMap = []
   let deletedCount = 0

   for (let i = 0; i < groupCount; i++) {
      for (let j = 0; j < progressCount; j++) {
         const mapIdx = i * progressCount + j
         const currMapCount = taskMap[mapIdx]
         const prevMapCount = mapIdx === 0 ? 0 : taskMap[mapIdx - 1]
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

   const newProgressOrder = [...progressOrder]
   newProgressOrder.splice(progressIndex, 1)
   return {
      progressOrder: newProgressOrder,
      tasks: newTasks,
      taskMap: newTaskMap
   }
}

module.exports = {
   validateProgress,
   prepareProgressData,
   createProgress,
   deleteProgress
}
