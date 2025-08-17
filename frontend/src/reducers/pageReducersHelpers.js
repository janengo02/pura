export const updateProgress = ({ progressOrder, updatedProgress }) => {
   const { title, titleColor, color, progressId } = updatedProgress
   const newProgressOrder = progressOrder.map((p) =>
      p.id === progressId
         ? {
              ...p,
              ...(title && { title }),
              ...(titleColor && { titleColor }),
              ...(color && { color })
           }
         : p
   )
   return { progressOrder: newProgressOrder }
}

export const updateGroup = ({ groupOrder, updatedGroup }) => {
   const { title, color, groupId } = updatedGroup
   const newGroupOrder = groupOrder.map((g) =>
      g.id === groupId
         ? {
              ...g,
              ...(title && { title }),
              ...(color && { color })
           }
         : g
   )
   return { groupOrder: newGroupOrder }
}
/**
 * Update task basic information
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Update payload
 * @param {string} payload.taskId - Task ID to update
 * @param {string} [payload.title] - New task title
 * @param {string} [payload.content] - New task content
 * @param {string} [payload.updateDate] - Update timestamp
 * @returns {Object} Updated state fragment
 */
export const updateTask = ({ tasks, payload }) => {
   return {
      tasks: tasks.map((task) =>
         task.id === payload.taskId
            ? {
                 ...task,
                 title:
                    payload.title !== undefined ? payload.title : task.title,
                 content:
                    payload.content !== undefined
                       ? payload.content
                       : task.content,
                 updateDate: payload.updateDate || task.updateDate
              }
            : task
      )
   }
}

/**
 * Remove task schedule slot from page state
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Remove payload
 * @param {string} payload.taskId - Task ID
 * @param {number} payload.slotIndex - Slot index to remove
 * @param {string} [payload.updateDate] - Update timestamp
 * @returns {Object} Updated state fragment
 */
export const removePageTaskScheduleSlot = ({ tasks, payload }) => {
   return {
      tasks: tasks.map((task) =>
         task.id === payload.taskId
            ? {
                 ...task,
                 schedule: task.schedule?.filter(
                    (slot, index) => index !== payload.slotIndex
                 ),
                 updateDate: payload.updateDate || task.updateDate
              }
            : task
      )
   }
}

/**
 * Add new task schedule slot in page state
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Add payload
 * @param {string} payload.taskId - Task ID
 * @param {Object} payload.newSlot - New schedule slot data
 * @param {string} [payload.updateDate] - Update timestamp
 * @returns {Object} Updated state fragment
 */
export const addPageTaskScheduleSlot = ({ tasks, payload }) => {
   return {
      tasks: tasks.map((task) =>
         task.id === payload.taskId
            ? {
                 ...task,
                 schedule: [...(task.schedule || []), payload.newSlot],
                 updateDate: payload.updateDate || task.updateDate
              }
            : task
      )
   }
}

/**
 * Update task schedule slot in page state
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Update payload
 * @param {string} payload.taskId - Task ID
 * @param {number} payload.slotIndex - Slot index to update
 * @param {string} payload.start - New start time
 * @param {string} payload.end - New end time
 * @param {string} [payload.updateDate] - Update timestamp
 * @returns {Object} Updated state fragment
 */
export const updatePageTaskScheduleSlot = ({ tasks, payload }) => {
   return {
      tasks: tasks.map((task) =>
         task.id === payload.taskId
            ? {
                 ...task,
                 schedule: task.schedule?.map((slot, index) =>
                    index === payload.slotIndex
                       ? {
                            ...slot,
                            start: payload.start,
                            end: payload.end
                         }
                       : slot
                 ),
                 updateDate: payload.updateDate || task.updateDate
              }
            : task
      )
   }
}

/**
 * Sync task schedule slot with Google Calendar in page state
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Sync payload
 * @param {string} payload.taskId - Task ID
 * @param {number} payload.slotIndex - Slot index
 * @param {string} payload.googleEventId - Google Calendar event ID
 * @param {string} payload.calendar_id - Google Calendar ID
 * @param {string} payload.accountEmail - Google account email
 * @returns {Object} Updated state fragment
 */
export const syncTaskScheduleInPage = ({ tasks, payload }) => {
   const updatedTasks = tasks.map((task) =>
      task.id === payload.taskId
         ? {
              ...task,
              schedule: task.schedule?.map((slot, index) =>
                 index === payload.slotIndex
                    ? {
                         ...slot,
                         googleEventId: payload.googleEventId,
                         googleCalendarId: payload.calendar_id,
                         googleAccountEmail: payload.accountEmail,
                         syncStatus: payload.syncStatus || '0'
                      }
                    : slot
              )
           }
         : task
   )

   return { tasks: updatedTasks }
}

/**
 * Update filter schedule
 * @param {Object} currentFilter - Current filter state
 * @param {Object} payload - Filter payload
 * @param {Array} payload.schedule - New schedule filter
 * @returns {Object} Updated state fragment
 */
export const updateFilterSchedule = ({ currentFilter, payload }) => {
   return {
      filter: {
         ...currentFilter,
         schedule: payload.schedule
      }
   }
}

/**
 * Update filter name
 * @param {Object} currentFilter - Current filter state
 * @param {Object} payload - Filter payload
 * @param {string} payload.name - New name filter
 * @returns {Object} Updated state fragment
 */
export const updateFilterName = ({ currentFilter, payload }) => {
   return {
      filter: {
         ...currentFilter,
         name: payload.name
      }
   }
}

/**
 * Find progress index by ID
 * @param {Array} progressOrder - Progress order array
 * @param {string} progressId - Progress ID to find
 * @returns {number} Index of progress or -1 if not found
 */
export const findProgressIndex = (progressOrder, progressId) => {
   return progressOrder.findIndex((p) => p && p.id === progressId)
}

/**
 * Find group index by ID
 * @param {Array} groupOrder - Group order array
 * @param {string} groupId - Group ID to find
 * @returns {number} Index of group or -1 if not found
 */
export const findGroupIndex = (groupOrder, groupId) => {
   return groupOrder.findIndex((g) => g && g.id === groupId)
}

export const getDefaultSchedule = () => {
   try {
      const stored = localStorage.getItem('filteredSchedule')
      return stored ? JSON.parse(stored) : ['1', '2']
   } catch {
      return ['1', '2']
   }
}

export const getDefaultName = () => {
   try {
      const stored = localStorage.getItem('filteredName')
      return stored ? JSON.parse(stored) : ''
   } catch {
      return ''
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
export const moveTask = ({
   tasks,
   taskMap,
   destination,
   source,
   draggableId
}) => {
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

export const createGroup = ({
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

export const deleteGroup = ({
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

export const createProgress = ({
   progressOrder,
   groupOrder,
   taskMap,
   newProgress
}) => {
   const newTaskMap = [...taskMap]
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

export const deleteProgress = ({
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

export const createTask = ({
   new_task_info,
   groupOrder,
   progressOrder,
   taskMap,
   tasks
}) => {
   const { groupId, progressId, newTask } = new_task_info

   const progressIndex = progressOrder.findIndex((p) => p.id === progressId)
   const groupIndex = groupOrder.findIndex((g) => g.id === groupId)
   if (progressIndex === -1 || groupIndex === -1) {
      return { tasks: [...tasks], taskMap: [...taskMap] }
   }

   const progressCount = progressOrder.length
   const taskMapIndex = groupIndex * progressCount + progressIndex

   const newTaskMap = [...taskMap]
   for (let i = taskMapIndex; i < newTaskMap.length; i++) {
      newTaskMap[i]++
   }

   const insertIndex = newTaskMap[taskMapIndex] - 1
   const newTasks = [...tasks]
   newTasks.splice(insertIndex, 0, newTask)

   return {
      tasks: newTasks,
      taskMap: newTaskMap
   }
}

export const deleteTask = ({ taskId, taskMap, tasks }) => {
   const taskIndex = tasks.findIndex((t) => t.id === taskId)
   if (taskIndex === -1) {
      return { tasks: [...tasks], taskMap: [...taskMap] }
   }

   const newTasks = [...tasks]
   newTasks.splice(taskIndex, 1)

   const newTaskMap = [...taskMap]
   for (let i = 0; i < newTaskMap.length; i++) {
      if (newTaskMap[i] > taskIndex) newTaskMap[i]--
   }

   return { tasks: newTasks, taskMap: newTaskMap }
}
