export const updateProgress = ({ progress_order, updatedProgress }) => {
   const { title, title_color, color, progress_id } = updatedProgress
   const newProgressOrder = progress_order.map((p) =>
      p._id === progress_id
         ? {
              ...p,
              ...(title && { title }),
              ...(title_color && { title_color }),
              ...(color && { color })
           }
         : p
   )
   return { progress_order: newProgressOrder }
}

export const updateGroup = ({ group_order, updatedGroup }) => {
   const { title, color, group_id } = updatedGroup
   const newGroupOrder = group_order.map((g) =>
      g._id === group_id
         ? {
              ...g,
              ...(title && { title }),
              ...(color && { color })
           }
         : g
   )
   return { group_order: newGroupOrder }
}
/**
 * Update task basic information
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Update payload
 * @param {string} payload.task_id - Task ID to update
 * @param {string} [payload.title] - New task title
 * @param {string} [payload.content] - New task content
 * @param {string} [payload.update_date] - Update timestamp
 * @returns {Object} Updated state fragment
 */
export const updateTask = ({ tasks, payload }) => {
   return {
      tasks: tasks.map((task) =>
         task._id === payload.task_id
            ? {
                 ...task,
                 title:
                    payload.title !== undefined ? payload.title : task.title,
                 content:
                    payload.content !== undefined
                       ? payload.content
                       : task.content,
                 update_date: payload.update_date || task.update_date
              }
            : task
      )
   }
}

/**
 * Remove task schedule slot from page state
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Remove payload
 * @param {string} payload.task_id - Task ID
 * @param {number} payload.slot_index - Slot index to remove
 * @param {string} [payload.update_date] - Update timestamp
 * @returns {Object} Updated state fragment
 */
export const removePageTaskScheduleSlot = ({ tasks, payload }) => {
   return {
      tasks: tasks.map((task) =>
         task._id === payload.task_id
            ? {
                 ...task,
                 schedule: task.schedule?.filter(
                    (slot, index) => index !== payload.slot_index
                 ),
                 update_date: payload.update_date || task.update_date
              }
            : task
      )
   }
}

/**
 * Add new task schedule slot in page state
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Add payload
 * @param {string} payload.task_id - Task ID
 * @param {Object} payload.newSlot - New schedule slot data
 * @param {string} [payload.update_date] - Update timestamp
 * @returns {Object} Updated state fragment
 */
export const addPageTaskScheduleSlot = ({ tasks, payload }) => {
   return {
      tasks: tasks.map((task) =>
         task._id === payload.task_id
            ? {
                 ...task,
                 schedule: [...(task.schedule || []), payload.newSlot],
                 update_date: payload.update_date || task.update_date
              }
            : task
      )
   }
}

/**
 * Update task schedule slot in page state
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Update payload
 * @param {string} payload.task_id - Task ID
 * @param {number} payload.slot_index - Slot index to update
 * @param {string} payload.start - New start time
 * @param {string} payload.end - New end time
 * @param {string} [payload.update_date] - Update timestamp
 * @returns {Object} Updated state fragment
 */
export const updatePageTaskScheduleSlot = ({ tasks, payload }) => {
   return {
      tasks: tasks.map((task) =>
         task._id === payload.task_id
            ? {
                 ...task,
                 schedule: task.schedule?.map((slot, index) =>
                    index === payload.slot_index
                       ? {
                            ...slot,
                            start: payload.start,
                            end: payload.end
                         }
                       : slot
                 ),
                 update_date: payload.update_date || task.update_date
              }
            : task
      )
   }
}

/**
 * Sync task schedule slot with Google Calendar in page state
 * @param {Array} tasks - Current tasks array
 * @param {Object} payload - Sync payload
 * @param {string} payload.task_id - Task ID
 * @param {number} payload.slot_index - Slot index
 * @param {string} payload.google_event_id - Google Calendar event ID
 * @param {string} payload.calendar_id - Google Calendar ID
 * @param {string} payload.account_email - Google account email
 * @returns {Object} Updated state fragment
 */
export const syncTaskScheduleInPage = ({ tasks, payload }) => {
   const updatedTasks = tasks.map((task) =>
      task._id === payload.task_id
         ? {
              ...task,
              schedule: task.schedule?.map((slot, index) =>
                 index === payload.slot_index
                    ? {
                         ...slot,
                         google_event_id: payload.google_event_id,
                         google_calendar_id: payload.calendar_id,
                         google_account_email: payload.account_email,
                         sync_status: payload.sync_status || '0'
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
 * @param {Array} progress_order - Progress order array
 * @param {string} progress_id - Progress ID to find
 * @returns {number} Index of progress or -1 if not found
 */
export const findProgressIndex = (progress_order, progress_id) => {
   return progress_order.findIndex((p) => p && p._id === progress_id)
}

/**
 * Find group index by ID
 * @param {Array} group_order - Group order array
 * @param {string} group_id - Group ID to find
 * @returns {number} Index of group or -1 if not found
 */
export const findGroupIndex = (group_order, group_id) => {
   return group_order.findIndex((g) => g && g._id === group_id)
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
 * @param {Array} params.task_map - Array mapping spaces to task counts/indices
 * @param {Object} params.destination - Destination drop location {droppableId, index}
 * @param {Object} params.source - Source drag location {droppableId, index}
 * @param {string} params.draggableId - ID of the dragged task
 * @returns {Object} Updated tasks and task_map arrays
 */
export const moveTask = ({
   tasks,
   task_map,
   destination,
   source,
   draggableId
}) => {
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

export const createGroup = ({
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

export const deleteGroup = ({
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

export const createProgress = ({
   progress_order,
   group_order,
   task_map,
   newProgress
}) => {
   const newTaskMap = [...task_map]
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

export const deleteProgress = ({
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

export const createTask = ({
   new_task_info,
   group_order,
   progress_order,
   task_map,
   tasks
}) => {
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

export const deleteTask = ({ task_id, task_map, tasks }) => {
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
