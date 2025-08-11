const Progress = require('../models/ProgressModel')

/**
 * Validate progress exists
 * @param {string} progressId - Progress ID to validate
 * @returns {Object|null} Progress object if exists, null if not found
 */
const validateProgress = async (progressId) => {
   const progress = await Progress.findById(progressId)
   if (!progress) return null
   return progress
}

/**
 * Prepare progress data object from request body
 * @param {Object} body - Request body data
 * @param {string} [body.title] - Progress title
 * @param {string} [body.title_color] - Progress title color
 * @param {string} [body.color] - Progress background color
 * @returns {Object} Prepared progress data object
 */
const prepareProgressData = (body) => {
   const { title, title_color, color } = body
   const data = {}
   if (title) data.title = title
   if (title_color) data.title_color = title_color
   if (color) data.color = color
   return data
}

const createProgress = ({
   progress_order,
   group_order,
   task_map,
   newProgress
}) => {
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

const deleteProgress = ({
   progressIndex,
   progress_order,
   group_order,
   tasks,
   task_map
}) => {
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

module.exports = {
   validateProgress,
   prepareProgressData,
   createProgress,
   deleteProgress
}
