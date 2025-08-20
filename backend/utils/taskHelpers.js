const prisma = require('../config/prisma')
const { ObjectId } = require('mongodb')
const { google } = require('googleapis')
const { encrypt, decrypt, isEncrypted } = require('./encryption')
const { setOAuthCredentials } = require('./calendarHelpers')
const { populatePage } = require('./pageHelpers')

const SCHEDULE_SYNCE_STATUS = {
   NONE: '0', // No sync event (no googleEventId)
   SYNCED: '1', // Event synced with Google Calendar
   ACCOUNT_NOT_CONNECTED: '2', // Google account not connected
   EVENT_NOT_FOUND: '3', // Event not found in Google Calendar
   CONFLICTED: '4', // Event not synced with Google Calendar (Schedule is mismatched)
   SYNC_ERROR: '5' // Error during sync operation
}

/**
 * Helper function to ensure schedule slot has an ID
 */
function ensureSlotId(slot) {
   if (!slot.id) {
      return {
         ...slot,
         id: new ObjectId().toString()
      }
   }
   return slot
}

/**
 * Helper function to extract string ID from ObjectId or string
 */
function extractId(obj) {
   if (!obj) return obj
   if (typeof obj === 'string') return obj
   if (typeof obj === 'object') {
      // Try different ways to get the ID
      if (obj._id) return obj._id.toString()
      if (obj.id) return obj.id.toString()
      if (obj.toHexString) return obj.toHexString()
      // Last resort - convert to string but check it's not [object Object]
      const str = obj.toString()
      return str !== '[object Object]' ? str : null
   }
   return obj
}

/**
 * Parse Google Calendar event times to ISO strings
 * @param {Object} startData - Event start data from Google Calendar
 * @param {Object} endData - Event end data from Google Calendar
 * @returns {Object} {eventStart, eventEnd} in ISO format
 */
const parseGoogleEventTime = (startData, endData) => {
   const startRaw = startData?.dateTime || startData?.date
   const endRaw = endData?.dateTime || endData?.date

   let eventStart, eventEnd

   if (startData?.date && !startData?.dateTime) {
      // All-day event - use local timezone approach like frontend
      const startDate = new Date(startRaw)
      startDate.setHours(0, 0, 0, 0) // Set to local midnight

      const endDate = new Date(endRaw)
      endDate.setHours(0, 0, 0, 0) // Set to local midnight

      // Apply frontend's processAllDayEndTime logic
      const timeDifferenceMs = endDate.getTime() - startDate.getTime()
      const daysDifference = timeDifferenceMs / (1000 * 60 * 60 * 24)

      if (daysDifference > 1) {
         // Multi-day event: keep original end time
         eventEnd = endDate.toISOString()
      } else {
         // Single-day event: subtract 1 day and set to end of day
         const adjustedEnd = new Date(endDate)
         adjustedEnd.setDate(adjustedEnd.getDate() - 1)
         adjustedEnd.setHours(23, 59, 59, 999)
         eventEnd = adjustedEnd.toISOString()
      }

      eventStart = startDate.toISOString()
   } else {
      // Timed event - normalize to ISO string
      eventStart = new Date(startRaw).toISOString()
      eventEnd = new Date(endRaw).toISOString()
   }

   return { eventStart, eventEnd }
}

/**
 * Calculate new task mapping when moving tasks
 * @param {Object} page - Page object
 * @param {string} taskId - Task ID to move
 * @param {string} [groupId] - Target group ID
 * @param {string} [progressId] - Target progress ID
 * @returns {Object} {newTaskArray, newTaskMap, newGroupIndex, newProgressIndex}
 */
const getNewMap = (page, taskId, groupId = null, progressId = null) => {
   const taskIndex = page.tasks.findIndex((t) => extractId(t) === taskId)
   let taskMapIndex = 0
   if (page.taskMap[0] <= taskIndex) {
      for (let i = 1; i < page.taskMap.length; i++) {
         if (page.taskMap[i - 1] <= taskIndex && page.taskMap[i] > taskIndex) {
            taskMapIndex = i
            break
         }
      }
   }
   const progressIndex = taskMapIndex % page.progressOrder.length
   const groupIndex = parseInt(
      (taskMapIndex - progressIndex) / page.progressOrder.length
   )
   let newProgressIndex = progressIndex
   let newGroupIndex = groupIndex
   let newTaskMapIndex = taskMapIndex
   const newTaskArray = page.tasks.slice()
   const newTaskMap = page.taskMap.slice()

   if (groupId) {
      newGroupIndex = page.groupOrder.findIndex(
         (id) => extractId(id) === groupId
      )
      newTaskMapIndex =
         newGroupIndex * page.progressOrder.length + progressIndex
   }
   if (progressId) {
      newProgressIndex = page.progressOrder.findIndex(
         (id) => extractId(id) === progressId
      )
      newTaskMapIndex =
         groupIndex * page.progressOrder.length + newProgressIndex
   }
   if (groupId || progressId) {
      const targetTask = page.tasks[taskIndex]

      let newTaskIndex = page.taskMap[newTaskMapIndex]
      if (newTaskMapIndex > taskMapIndex) {
         newTaskIndex--
      }
      newTaskArray.splice(taskIndex, 1)
      newTaskArray.splice(newTaskIndex, 0, targetTask)
      // Moving between different columns
      if (newTaskMapIndex < taskMapIndex) {
         for (let i = newTaskMapIndex; i < taskMapIndex; i++) {
            newTaskMap[i]++
         }
      } else {
         for (let i = taskMapIndex; i < newTaskMapIndex; i++) {
            newTaskMap[i]--
         }
      }
   }

   return { newTaskArray, newTaskMap, newGroupIndex, newProgressIndex }
}

/**
 * Sync task schedule slot with Google Calendar
 * @param {string} taskId - Task ID
 * @param {string} taskTitle - Task title
 * @param {string} taskContent - Task content
 * @param {Object} slot - Schedule slot object
 * @param {string} accountEmail - Google account email
 * @param {string} calendarId - Google calendar ID
 * @param {string} userId - User ID
 * @param {string} syncAction - Action ('create', 'update', 'delete')
 * @returns {Object} {success, event} or {success, error}
 */
const syncTaskSlotWithGoogle = async (
   taskId,
   taskTitle,
   taskContent,
   slot,
   accountEmail,
   calendarId,
   userId,
   syncAction
) => {
   try {
      const user = await prisma.user.findUnique({
         where: { id: userId },
         include: { googleAccounts: true }
      })
      if (!user) {
         return { success: false, message: 'User not found' }
      }

      const account = user.googleAccounts.find(
         (acc) => acc.accountEmail === accountEmail
      )
      if (!account) {
         return { success: true } // No sync needed if account not found
      }

      // Decrypt the refresh token before use
      const refreshToken = isEncrypted(account.refreshToken) 
         ? decrypt(account.refreshToken) 
         : account.refreshToken

      const oauth2Client = setOAuthCredentials(refreshToken)
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const originalEvent = await calendar.events.get({
         auth: oauth2Client,
         calendarId: calendarId || 'primary',
         eventId: slot.googleEventId
      })
      const eventData = originalEvent.data
      try {
         let event

         if (syncAction === 'update' && slot.googleEventId) {
            // Update existing event
            event = await calendar.events.update({
               calendarId: calendarId || 'primary',
               eventId: slot.googleEventId,
               requestBody: {
                  ...eventData,
                  summary: taskTitle,
                  description: taskContent,
                  start: {
                     dateTime: new Date(slot.start).toISOString()
                  },
                  end: {
                     dateTime: new Date(slot.end).toISOString()
                  }
               }
            })
         } else if (syncAction === 'create' || !slot.googleEventId) {
            // Create new event
            event = await calendar.events.insert({
               calendarId: calendarId || 'primary',
               requestBody: {
                  summary: taskTitle,
                  description: taskContent,
                  start: {
                     dateTime: new Date(slot.start).toISOString()
                  },
                  end: {
                     dateTime: new Date(slot.end).toISOString()
                  },
                  extendedProperties: {
                     private: {
                        puraTaskId: taskId
                     }
                  }
               }
            })
         }

         return { success: true, event: event.data || event }
      } catch (err) {
         return { success: false, error: err.message }
      }
   } catch (err) {
      return { success: false, error: err.message }
   }
}
/**
 * Delete Google Calendar events for removed schedule slots
 * @param {Array} oldSchedule - Previous schedule array
 * @param {Array} newSchedule - New schedule array
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
const deleteGoogleEventsForRemovedSlots = async (
   oldSchedule,
   newSchedule,
   userId
) => {
   try {
      const user = await prisma.user.findUnique({
         where: { id: userId },
         include: { googleAccounts: true }
      })

      // Find slots that were removed
      const removedSlots = oldSchedule.filter((oldSlot) => {
         return (
            oldSlot.googleEventId &&
            !newSchedule.find(
               (newSlot) => newSlot.googleEventId === oldSlot.googleEventId
            )
         )
      })

      // Group removed slots by account
      const slotsByAccount = {}
      removedSlots.forEach((slot) => {
         if (slot.googleEventId && slot.googleAccountEmail) {
            if (!slotsByAccount[slot.googleAccountEmail]) {
               slotsByAccount[slot.googleAccountEmail] = []
            }
            slotsByAccount[slot.googleAccountEmail].push(slot)
         }
      })

      // Delete Google events for each account
      for (const [accountEmail, slots] of Object.entries(slotsByAccount)) {
         const account = user.googleAccounts.find(
            (acc) => acc.accountEmail === accountEmail
         )
         if (!account) continue

         // Decrypt the refresh token before use
      const refreshToken = isEncrypted(account.refreshToken) 
         ? decrypt(account.refreshToken) 
         : account.refreshToken

      const oauth2Client = setOAuthCredentials(refreshToken)
         const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

         for (const slot of slots) {
            try {
               await calendar.events.delete({
                  calendarId: slot.googleCalendarId || 'primary',
                  eventId: slot.googleEventId
               })
            } catch (err) {
               // Event might not exist or already deleted
            }
         }
      }
   } catch (err) {
      // Event might not exist or already deleted
   }
}

/**
 * Update task from Google Calendar event changes
 * @param {string} eventId - Google Calendar event ID
 * @param {Object} eventData - Updated event data
 * @param {string} [originalEventId] - Original event ID if changed
 * @param {string} [newCalendarId] - New calendar ID if moved
 * @returns {Object} {success, task} or {success, message/error}
 */
const updateTaskFromGoogleEvent = async (
   eventId,
   eventData,
   originalEventId = null,
   newCalendarId = null
) => {
   try {
      // Check if this is a Pura task event using extendedProperties
      if (!eventData.extendedProperties?.private?.puraTaskId) {
         return { success: false, message: 'Not a Pura task event' }
      }

      const taskId = eventData.extendedProperties.private.puraTaskId

      // Find the task
      const task = await prisma.task.findUnique({ where: { id: taskId } })

      if (!task) {
         return { success: false, message: 'Task not found' }
      }

      // Find the schedule slot by eventId (try both current and original event ID)
      let slotIndex = task.schedule.findIndex(
         (slot) => slot.googleEventId === eventId
      )

      // If not found with current event ID and we have an original event ID, try that
      if (slotIndex === -1 && originalEventId) {
         slotIndex = task.schedule.findIndex(
            (slot) => slot.googleEventId === originalEventId
         )
      }

      if (slotIndex === -1 || !task.schedule[slotIndex]) {
         return { success: false, message: 'Schedule slot not found' }
      }

      // Update task title and content from event data
      task.title = eventData.summary || task.title
      task.content = eventData.description || task.content

      // Update the schedule slot
      task.schedule[slotIndex].start = new Date(
         eventData.start.dateTime || eventData.start.date
      )
      task.schedule[slotIndex].end = new Date(
         eventData.end.dateTime || eventData.end.date
      )

      // Update the event ID if it changed (event was moved to different calendar)
      if (originalEventId && eventId !== originalEventId) {
         task.schedule[slotIndex].googleEventId = eventId
      }

      // Update the calendar ID if it changed (event was moved to different calendar)
      if (
         newCalendarId &&
         newCalendarId !== task.schedule[slotIndex].googleCalendarId
      ) {
         task.schedule[slotIndex].googleCalendarId = newCalendarId
      }

      // Ensure all schedule slots have IDs and update the task
      const scheduleWithIds = task.schedule.map(ensureSlotId)
      const updatedTask = await prisma.task.update({
         where: { id: taskId },
         data: {
            title: task.title,
            content: task.content,
            schedule: scheduleWithIds,
            updateDate: new Date()
         }
      })

      return { success: true, task: updatedTask }
   } catch (err) {
      return { success: false, error: err.message }
   }
}
/**
 * Calculate sync status for a schedule slot
 * @param {Object} slot - Schedule slot object
 * @param {string} userId - User ID
 * @returns {Object} Slot with syncStatus and Google event data
 */
const calculateSlotSyncStatus = async (slot, userId) => {
   // NONE = no sync event (no googleEventId)
   if (!slot.googleEventId) {
      return {
         ...slot,
         syncStatus: SCHEDULE_SYNCE_STATUS.NONE
      }
   }

   // Get user to check account connectivity
   const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { googleAccounts: true }
   })
   if (!user) {
      return {
         ...slot,
         syncStatus: SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED
      }
   }

   // ACCOUNT_NOT_CONNECTED = not synced (google account cannot be connected)
   const account = user.googleAccounts?.find(
      (acc) => acc.accountEmail === slot.googleAccountEmail
   )
   if (!account) {
      return {
         ...slot,
         syncStatus: SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED
      }
   }

   let oauth2Client, calendar, event
   try {
      // Decrypt the refresh token before use
      const refreshToken = isEncrypted(account.refreshToken) 
         ? decrypt(account.refreshToken) 
         : account.refreshToken

      oauth2Client = setOAuthCredentials(refreshToken)
      calendar = google.calendar({ version: 'v3', auth: oauth2Client })
   } catch (err) {
      return {
         ...slot,
         syncStatus: SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED
      }
   }

   try {
      event = await calendar.events.get({
         calendarId: slot.googleCalendarId || 'primary',
         eventId: slot.googleEventId
      })
   } catch (err) {
      // EVENT_NOT_FOUND = not synced (account ok, event not found)
      return {
         ...slot,
         syncStatus: SCHEDULE_SYNCE_STATUS.EVENT_NOT_FOUND
      }
   }

   if (event.data.status === 'cancelled') {
      // EVENT_NOT_FOUND = not synced (event cancelled)
      return {
         ...slot,
         syncStatus: SCHEDULE_SYNCE_STATUS.EVENT_NOT_FOUND
      }
   }

   // Compare slot schedule with event schedule
   const slotStart = new Date(slot.start).toISOString()
   const slotEnd = new Date(slot.end).toISOString()

   // Parse Google event times properly (handles both timed and all-day events)
   const { eventStart, eventEnd } = parseGoogleEventTime(
      event.data.start,
      event.data.end
   )

   if (slotStart === eventStart && slotEnd === eventEnd) {
      // SYNCED = synced normally
      return {
         ...slot,
         syncStatus: SCHEDULE_SYNCE_STATUS.SYNCED,
         googleEventStart: eventStart,
         googleEventEnd: eventEnd
      }
   } else {
      // CONFLICTED = not synced (event found, but schedule mismatch)
      return {
         ...slot,
         syncStatus: SCHEDULE_SYNCE_STATUS.CONFLICTED,
         googleEventStart: eventStart,
         googleEventEnd: eventEnd
      }
   }
}

/**
 * Format task response with sync status
 * @param {Object} task - Task object
 * @param {Object} page - Page object
 * @param {string} [userId] - User ID for sync status calculation
 * @returns {Object} {task, page} formatted response
 */
const formatTaskResponse = async (task, page, userId = null) => {
   const { newGroupIndex, newProgressIndex } = getNewMap(page, task.id)

   const groupId = extractId(page.groupOrder[newGroupIndex])
   const progressId = extractId(page.progressOrder[newProgressIndex])

   const group = await prisma.group.findUnique({
      where: { id: groupId }
   })
   const progress = await prisma.progress.findUnique({
      where: { id: progressId }
   })

   // Calculate sync status for schedule if userId is provided
   let scheduleWithSync = task.schedule
   if (userId && task.schedule && task.schedule.length > 0) {
      scheduleWithSync = await Promise.all(
         task.schedule.map((slot) => calculateSlotSyncStatus(slot, userId))
      )
   }

   const formattedTask = {
      id: task.id,
      title: task.title,
      schedule: scheduleWithSync,
      content: task.content,
      createDate: task.createDate,
      updateDate: task.updateDate,
      group,
      progress
   }

   return { task: formattedTask, page }
}

/**
 * Update task basic info and sync with Google Calendar
 * @param {string} taskId - Task ID
 * @param {string} pageId - Page ID
 * @param {string} userId - User ID
 * @param {Object} data - Update data
 * @param {string} [data.title] - New task title
 * @param {string} [data.content] - New task content
 * @returns {Object} {success, task, page} or {success, message, statusCode}
 */
const updateTaskBasicInfo = async (
   taskId,
   pageId,
   userId,
   { title, content }
) => {
   const task = await prisma.task.findUnique({
      where: { id: taskId }
   })

   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }

   const updateData = { updateDate: new Date() }
   if (title !== undefined) updateData.title = title
   if (content !== undefined) updateData.content = content

   if (title !== undefined || content !== undefined) {
      // Sync title and/or content with Google Calendar if it has schedule slots
      for (let i = 0; i < task.schedule.length; i++) {
         const slot = task.schedule[i]
         if (slot.googleEventId) {
            const result = await syncTaskSlotWithGoogle(
               task.id,
               updateData.title || task.title,
               updateData.content || task.content,
               slot,
               slot.googleAccountEmail,
               slot.googleCalendarId,
               userId,
               'update'
            )

            if (!result.success) {
               return {
                  success: false,
                  message:
                     result.message || 'Failed to sync with Google Calendar',
                  statusCode: 400
               }
            }
         }
      }
   }

   const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData
   })

   // Get updated page data
   const page = await prisma.page.findUnique({
      where: { id: pageId }
   })

   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   // Populate page with related data
   const populatedPage = await populatePage(page)

   // Update page's updateDate since task was modified
   await prisma.page.update({
      where: { id: pageId },
      data: { updateDate: new Date() }
   })

   return { success: true, task: updatedTask, page: populatedPage }
}

/**
 * Move task to different group/progress
 * @param {string} taskId - Task ID
 * @param {string} pageId - Page ID
 * @param {Object} data - Move data
 * @param {string} [data.groupId] - Target group ID
 * @param {string} [data.progressId] - Target progress ID
 * @returns {Object} {success, task, page} or {success, message, statusCode}
 */
const moveTask = async (taskId, pageId, { groupId, progressId }) => {
   const task = await prisma.task.findUnique({ where: { id: taskId } })
   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }
   const page = await prisma.page.findUnique({ where: { id: pageId } })
   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }
   console.log('getNewMap', page, taskId, groupId, progressId)

   const { newTaskArray, newTaskMap } = getNewMap(
      page,
      taskId,
      groupId,
      progressId
   )

   // Update page with new task array and task map
   const updatedPage = await prisma.page.update({
      where: { id: pageId },
      data: {
         tasks: newTaskArray,
         taskMap: newTaskMap,
         updateDate: new Date()
      }
   })

   // Update task's updateDate
   await prisma.task.update({
      where: { id: taskId },
      data: { updateDate: new Date() }
   })

   // Populate page with related data
   const populatedPage = await populatePage(updatedPage)

   return { success: true, task, page: populatedPage }
}

/**
 * Update specific schedule slot time
 * @param {string} taskId - Task ID
 * @param {string} pageId - Page ID
 * @param {string} userId - User ID
 * @param {Object} data - Update data
 * @param {number} data.slotIndex - Slot index to update
 * @param {string} [data.start] - New start time
 * @param {string} [data.end] - New end time
 * @returns {Object} {success, task, page} or {success, message, statusCode}
 */
const updateTaskSchedule = async (
   taskId,
   pageId,
   userId,
   { slotIndex, start, end }
) => {
   const task = await prisma.task.findUnique({ where: { id: taskId } })

   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }

   if (!task.schedule || slotIndex < 0 || slotIndex >= task.schedule.length) {
      return { success: false, message: 'Invalid slot index', statusCode: 400 }
   }

   const slot = task.schedule[slotIndex]
   const oldStart = slot.start
   const oldEnd = slot.end

   // Update slot times
   if (start !== undefined) slot.start = start
   if (end !== undefined) slot.end = end

   // Sync with Google Calendar if there's a googleEventId and times changed
   if (slot.googleEventId && (start !== oldStart || end !== oldEnd)) {
      const result = await syncTaskSlotWithGoogle(
         task.id,
         task.title,
         task.content,
         slot,
         slot.googleAccountEmail,
         slot.googleCalendarId,
         userId,
         'update'
      )

      if (!result.success) {
         return {
            success: false,
            message: result.message || 'Failed to sync with Google Calendar',
            statusCode: 400
         }
      }
   }

   // Update the task schedule and ensure all slots have IDs
   const updatedSchedule = [...task.schedule]
   updatedSchedule[slotIndex] = slot
   const scheduleWithIds = updatedSchedule.map(ensureSlotId)

   const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
         schedule: scheduleWithIds,
         updateDate: new Date()
      }
   })

   // Get updated page data
   const page = await prisma.page.findUnique({ where: { id: pageId } })

   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   // Populate page with related data
   const populatedPage = await populatePage(page)

   // Update page's updateDate since task was modified
   await prisma.page.update({
      where: { id: pageId },
      data: { updateDate: new Date() }
   })

   return { success: true, task: updatedTask, page: populatedPage }
}

/**
 * Add new schedule slot to task
 * @param {string} taskId - Task ID
 * @param {string} pageId - Page ID
 * @param {Object} data - Slot data
 * @param {string} data.start - Start time
 * @param {string} data.end - End time
 * @returns {Object} {success, task, page, newSlotIndex} or {success, message, statusCode}
 */
const addTaskScheduleSlot = async (taskId, pageId, { start, end }) => {
   const task = await prisma.task.findUnique({ where: { id: taskId } })

   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }

   const currentSchedule = task.schedule || []
   const newSlot = {
      id: new ObjectId().toString(),
      start,
      end
   }
   const updatedSchedule = [...currentSchedule, newSlot]

   const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
         schedule: updatedSchedule,
         updateDate: new Date()
      }
   })

   // Get updated page data

   const page = await prisma.page.findUnique({ where: { id: pageId } })

   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   // Populate page with related data
   const populatedPage = await populatePage(page)

   // Update page's updateDate since task was modified
   await prisma.page.update({
      where: { id: pageId },
      data: { updateDate: new Date() }
   })

   return {
      success: true,
      task: updatedTask,
      page: populatedPage,
      newSlotIndex: updatedSchedule.length - 1
   }
}

/**
 * Remove schedule slot from task
 * @param {string} taskId - Task ID
 * @param {string} pageId - Page ID
 * @param {string} userId - User ID
 * @param {Object} data - Remove data
 * @param {number} data.slotIndex - Slot index to remove
 * @returns {Object} {success, task, page} or {success, message, statusCode}
 */
const removeTaskScheduleSlot = async (
   taskId,
   pageId,
   userId,
   { slotIndex }
) => {
   const task = await prisma.task.findUnique({ where: { id: taskId } })

   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }

   if (!task.schedule || slotIndex < 0 || slotIndex >= task.schedule.length) {
      return { success: false, message: 'Invalid slot index', statusCode: 400 }
   }

   const slotToRemove = task.schedule[slotIndex]

   // Delete Google event if exists
   if (slotToRemove.googleEventId) {
      await deleteGoogleEventsForRemovedSlots([slotToRemove], [], userId)
   }

   // Create updated schedule without the removed slot and ensure all have IDs
   const updatedSchedule = [...task.schedule]
   updatedSchedule.splice(slotIndex, 1)
   const scheduleWithIds = updatedSchedule.map(ensureSlotId)

   // Update task with new schedule
   const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
         schedule: scheduleWithIds,
         updateDate: new Date()
      }
   })

   // Get updated page data
   const page = await prisma.page.findUnique({ where: { id: pageId } })

   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   // Populate page with related data
   const populatedPage = await populatePage(page)

   // Update page's updateDate since task was modified
   await prisma.page.update({
      where: { id: pageId },
      data: { updateDate: new Date() }
   })

   return { success: true, task: updatedTask, page: populatedPage }
}

/**
 * Sync task slot with Google Calendar helper function
 * @param {string} taskId - Task ID
 * @param {number} slotIndex - Slot index
 * @param {string} [accountEmail] - Google account email
 * @param {string} [calendarId] - Google calendar ID
 * @param {string} userId - User ID
 * @param {string} [syncAction='create'] - Sync action
 * @returns {Object} {success, task, page, event} or {success, message, statusCode}
 */
const syncTaskSlotWithGoogleHelper = async (
   taskId,
   slotIndex,
   accountEmail = null,
   calendarId = null,
   userId,
   syncAction = 'create'
) => {
   try {
      // Validation: Check if task exists

      const task = await prisma.task.findUnique({ where: { id: taskId } })
      if (!task) {
         return { success: false, message: 'Task not found', statusCode: 404 }
      }

      // Validation: Check if slot index is valid
      if (
         !task.schedule ||
         slotIndex < 0 ||
         slotIndex >= task.schedule.length
      ) {
         return {
            success: false,
            message: 'Invalid slot index',
            statusCode: 400
         }
      }

      const slot = task.schedule[slotIndex]
      let result = null

      // Handle sync action
      if (syncAction === 'delete') {
         // Clear sync information for unsync action
         task.schedule[slotIndex].googleEventId = null
         task.schedule[slotIndex].googleAccountEmail = null
         task.schedule[slotIndex].googleCalendarId = null
         // Create a mock result for unsync action
         result = {
            success: true,
            event: {
               id: null,
               status: 'unsynced',
               summary: 'Task unsynced from Google Calendar'
            }
         }
      } else {
         // Sync with Google Calendar
         result = await syncTaskSlotWithGoogle(
            taskId,
            task.title,
            task.content,
            slot,
            accountEmail,
            calendarId,
            userId,
            syncAction
         )

         if (!result.success) {
            return {
               success: false,
               message: result.message || 'Failed to sync with Google Calendar',
               statusCode: 400
            }
         }

         // Set sync information for create/update actions
         task.schedule[slotIndex].googleEventId = result.event.id
         task.schedule[slotIndex].googleAccountEmail = accountEmail
         task.schedule[slotIndex].googleCalendarId = calendarId
      }

      // Update task with new schedule and updateDate, ensuring all slots have IDs
      const updatedSchedule = [...task.schedule]
      const scheduleWithIds = updatedSchedule.map(ensureSlotId)
      const updatedTask = await prisma.task.update({
         where: { id: taskId },
         data: {
            schedule: scheduleWithIds,
            updateDate: new Date()
         }
      })

      // Get page to determine group and progress
      const page = await prisma.page.findFirst({
         where: { tasks: { has: taskId } }
      })

      if (!page) {
         return { success: false, message: 'Page not found', statusCode: 404 }
      }

      // Populate page with related data
      const populatedPage = await populatePage(page)

      return {
         success: true,
         task: updatedTask,
         page: populatedPage,
         event: result.event
      }
   } catch (err) {
      return { success: false, error: err.message, statusCode: 500 }
   }
}

module.exports = {
   SCHEDULE_SYNCE_STATUS,
   extractId,
   getNewMap,
   deleteGoogleEventsForRemovedSlots,
   updateTaskFromGoogleEvent,
   syncTaskSlotWithGoogle,
   syncTaskSlotWithGoogleHelper,
   calculateSlotSyncStatus,
   formatTaskResponse,
   updateTaskBasicInfo,
   moveTask,
   updateTaskSchedule,
   addTaskScheduleSlot,
   removeTaskScheduleSlot
}
