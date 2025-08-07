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
