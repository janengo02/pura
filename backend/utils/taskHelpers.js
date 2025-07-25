const Task = require('../models/TaskModel')
const User = require('../models/UserModel')
const Group = require('../models/GroupModel')
const Progress = require('../models/ProgressModel')
const Page = require('../models/PageModel')
const { google } = require('googleapis')
const { setOAuthCredentials } = require('./googleAccountHelper')
const { SCHEDULE_SYNCE_STATUS } = require('@pura/shared')

/**
 * Parse Google Calendar event times to ISO strings
 * Handles both timed events (dateTime) and all-day events (date)
 * Matches frontend logic in googleAccountReducersHelpers.js
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

const getNewMap = (page, task_id, group_id = null, progress_id = null) => {
   const taskIndex = page.tasks.findIndex((t) => t.equals(task_id))
   let taskMapIndex = 0
   if (page.task_map[0] <= taskIndex) {
      for (let i = 1; i < page.task_map.length; i++) {
         if (
            page.task_map[i - 1] <= taskIndex &&
            page.task_map[i] > taskIndex
         ) {
            taskMapIndex = i
            break
         }
      }
   }
   const progressIndex = taskMapIndex % page.progress_order.length
   const groupIndex = parseInt(
      (taskMapIndex - progressIndex) / page.progress_order.length
   )
   let newProgressIndex = progressIndex
   let newGroupIndex = groupIndex
   let newTaskMapIndex = taskMapIndex
   const newTaskArray = page.tasks.slice()
   const newTaskMap = page.task_map.slice()

   if (group_id) {
      newGroupIndex = page.group_order.indexOf(group_id)
      newTaskMapIndex =
         newGroupIndex * page.progress_order.length + progressIndex
   }
   if (progress_id) {
      newProgressIndex = page.progress_order.indexOf(progress_id)
      newTaskMapIndex =
         groupIndex * page.progress_order.length + newProgressIndex
   }
   if (group_id || progress_id) {
      const targetTask = page.tasks[taskIndex]

      let newTaskIndex = page.task_map[newTaskMapIndex]
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
 * Sync a specific task schedule slot with Google Calendar
 * Creates or updates a Google Calendar event for a specific schedule slot
 */
const syncTaskSlotWithGoogle = async (
   taskId,
   taskTitle,
   slot,
   accountEmail,
   calendarId,
   userId,
   syncAction
) => {
   try {
      const user = await User.findById(userId)
      if (!user) {
         return { success: false, message: 'User not found' }
      }

      const account = user.google_accounts.find(
         (acc) => acc.account_email === accountEmail
      )
      if (!account) {
         return { success: false, message: 'Google account not found' }
      }

      const oauth2Client = setOAuthCredentials(account.refresh_token)
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
      const originalEvent = await calendar.events.get({
         auth: oauth2Client,
         calendarId: calendarId || 'primary',
         eventId: slot.google_event_id
      })
      const eventData = originalEvent.data
      try {
         let event

         if (syncAction === 'update' && slot.google_event_id) {
            // Update existing event
            event = await calendar.events.update({
               calendarId: calendarId || 'primary',
               eventId: slot.google_event_id,
               requestBody: {
                  ...eventData,
                  start: {
                     dateTime: new Date(slot.start).toISOString()
                  },
                  end: {
                     dateTime: new Date(slot.end).toISOString()
                  }
               }
            })
         } else if (syncAction === 'create' || !slot.google_event_id) {
            // Create new event
            event = await calendar.events.insert({
               calendarId: calendarId || 'primary',
               requestBody: {
                  summary: taskTitle,
                  colorId: '3', // Purple color for task events
                  start: {
                     dateTime: new Date(slot.start).toISOString()
                  },
                  end: {
                     dateTime: new Date(slot.end).toISOString()
                  },
                  extendedProperties: {
                     private: {
                        pura_task_id: taskId
                     }
                  }
               }
            })
         }

         return { success: true, event: event.data || event }
      } catch (err) {
         console.error(`Error syncing slot ${slot}:`, err)
         return { success: false, error: err.message }
      }
   } catch (err) {
      console.error('Error syncing task slot:', err)
      return { success: false, error: err.message }
   }
}
/**
 * Delete Google Calendar events for removed schedule slots
 */
const deleteGoogleEventsForRemovedSlots = async (
   oldSchedule,
   newSchedule,
   userId
) => {
   try {
      const user = await User.findById(userId)

      // Find slots that were removed
      const removedSlots = oldSchedule.filter((oldSlot) => {
         return (
            oldSlot.google_event_id &&
            !newSchedule.find(
               (newSlot) => newSlot.google_event_id === oldSlot.google_event_id
            )
         )
      })

      // Group removed slots by account
      const slotsByAccount = {}
      removedSlots.forEach((slot) => {
         if (slot.google_event_id && slot.google_account_email) {
            if (!slotsByAccount[slot.google_account_email]) {
               slotsByAccount[slot.google_account_email] = []
            }
            slotsByAccount[slot.google_account_email].push(slot)
         }
      })

      // Delete Google events for each account
      for (const [accountEmail, slots] of Object.entries(slotsByAccount)) {
         const account = user.google_accounts.find(
            (acc) => acc.account_email === accountEmail
         )
         if (!account) continue

         const oauth2Client = setOAuthCredentials(account.refresh_token)
         const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

         for (const slot of slots) {
            try {
               await calendar.events.delete({
                  calendarId: slot.google_calendar_id || 'primary',
                  eventId: slot.google_event_id
               })
            } catch (err) {
               console.error('Error deleting Google event:', err)
            }
         }
      }
   } catch (err) {
      console.error('Error deleting Google events:', err)
   }
}

/**
 * Handle Google Calendar event updates from calendar UI
 * Updates the corresponding task schedule slot
 */
const updateTaskFromGoogleEvent = async (eventId, eventData) => {
   try {
      // Check if this is a Pura task event using extendedProperties
      if (!eventData.extendedProperties?.private?.pura_task_id) {
         return { success: false, message: 'Not a Pura task event' }
      }

      const taskId = eventData.extendedProperties.private.pura_task_id

      // Find the task
      const task = await Task.findById(taskId)

      if (!task) {
         return { success: false, message: 'Task not found' }
      }

      const slotIndex = task.schedule.findIndex(
         (slot) => slot.google_event_id === eventId
      )

      if (!task.schedule[slotIndex]) {
         return { success: false, message: 'Schedule slot not found' }
      }

      // Update the schedule slot
      task.schedule[slotIndex].start = new Date(
         eventData.start.dateTime || eventData.start.date
      )
      task.schedule[slotIndex].end = new Date(
         eventData.end.dateTime || eventData.end.date
      )

      task.update_date = new Date()
      await task.save()

      return { success: true, task }
   } catch (err) {
      console.error('Error updating task from Google event:', err)
      return { success: false, error: err.message }
   }
}
/**
 * Calculate sync status for a schedule slot
 */
const calculateSlotSyncStatus = async (slot, userId) => {
   // NONE = no sync event (no google_event_id)
   if (!slot.google_event_id) {
      return {
         ...slot.toObject(),
         sync_status: SCHEDULE_SYNCE_STATUS.NONE
      }
   }

   // Get user to check account connectivity
   const user = await User.findById(userId)
   if (!user) {
      return {
         ...slot.toObject(),
         sync_status: SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED
      }
   }

   // ACCOUNT_NOT_CONNECTED = not synced (google account cannot be connected)
   const account = user.google_accounts?.find(
      (acc) => acc.account_email === slot.google_account_email
   )
   if (!account) {
      return {
         ...slot.toObject(),
         sync_status: SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED
      }
   }
   console.log(account)

   let oauth2Client, calendar, event
   try {
      oauth2Client = setOAuthCredentials(account.refresh_token)
      calendar = google.calendar({ version: 'v3', auth: oauth2Client })
   } catch (err) {
      return {
         ...slot.toObject(),
         sync_status: SCHEDULE_SYNCE_STATUS.ACCOUNT_NOT_CONNECTED
      }
   }

   try {
      event = await calendar.events.get({
         calendarId: slot.google_calendar_id || 'primary',
         eventId: slot.google_event_id
      })
   } catch (err) {
      // EVENT_NOT_FOUND = not synced (account ok, event not found)
      return {
         ...slot.toObject(),
         sync_status: SCHEDULE_SYNCE_STATUS.EVENT_NOT_FOUND
      }
   }

   if (event.data.status === 'cancelled') {
      // EVENT_NOT_FOUND = not synced (event cancelled)
      return {
         ...slot.toObject(),
         sync_status: SCHEDULE_SYNCE_STATUS.EVENT_NOT_FOUND
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
         ...slot.toObject(),
         sync_status: SCHEDULE_SYNCE_STATUS.SYNCED,
         google_event_start: eventStart,
         google_event_end: eventEnd
      }
   } else {
      // CONFLICTED = not synced (event found, but schedule mismatch)
      return {
         ...slot.toObject(),
         sync_status: SCHEDULE_SYNCE_STATUS.CONFLICTED,
         google_event_start: eventStart,
         google_event_end: eventEnd
      }
   }
}

/**
 * Standardized task response formatter with sync status
 */
const formatTaskResponse = async (task, page, userId = null) => {
   const { newGroupIndex, newProgressIndex } = getNewMap(page, task._id)
   const group = await Group.findById(page.group_order[newGroupIndex])
   const progress = await Progress.findById(
      page.progress_order[newProgressIndex]
   )

   // Calculate sync status for schedule if userId is provided
   let scheduleWithSync = task.schedule
   if (userId && task.schedule && task.schedule.length > 0) {
      scheduleWithSync = await Promise.all(
         task.schedule.map((slot) => calculateSlotSyncStatus(slot, userId))
      )
   }

   const formattedTask = {
      _id: task._id,
      title: task.title,
      schedule: scheduleWithSync,
      content: task.content,
      create_date: task.create_date,
      update_date: task.update_date,
      group,
      progress
   }

   return { task: formattedTask, page }
}

/**
 * Update task basic info (title, content)
 */
const updateTaskBasicInfo = async (taskId, pageId, { title, content }) => {
   const task = await Task.findById(taskId)

   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }

   if (title !== undefined) task.title = title
   if (content !== undefined) task.content = content
   task.update_date = new Date()

   if (title !== undefined) {
      // Sync title with Google Calendar if it has schedule slots
      for (let i = 0; i < task.schedule.length; i++) {
         const slot = task.schedule[i]
         if (slot.google_event_id) {
            const result = await syncTaskSlotWithGoogle(
               task._id,
               title,
               slot,
               slot.google_account_email,
               slot.google_calendar_id,
               task.user_id,
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

   await task.save()

   // Get updated page data
   const page = await Page.findById(pageId)
      .populate('progress_order', [
         'title',
         'title_color',
         'color',
         'visibility'
      ])
      .populate('group_order', ['title', 'color', 'visibility'])
      .populate('tasks', ['title', 'schedule'])

   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   // Update page's update_date since task was modified
   page.update_date = new Date()
   await page.save()

   return { success: true, task, page }
}

/**
 * Move task to different group/progress
 */
const moveTask = async (taskId, pageId, { group_id, progress_id }) => {
   const task = await Task.findById(taskId)
   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }
   const page = await Page.findById(pageId)
   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   const { newTaskArray, newTaskMap } = getNewMap(
      page,
      taskId,
      group_id,
      progress_id
   )

   const updatedPage = await Page.findOneAndUpdate(
      { _id: pageId },
      {
         $set: {
            tasks: newTaskArray,
            update_date: new Date()
         }
      },
      { new: true }
   )
      .populate('progress_order', [
         'title',
         'title_color',
         'color',
         'visibility'
      ])
      .populate('group_order', ['title', 'color', 'visibility'])
      .populate('tasks', ['title', 'schedule'])
   // Data: Update page's task_map
   updatedPage.task_map = newTaskMap
   await updatedPage.save()

   task.update_date = new Date()
   await task.save()

   return { success: true, task, page: updatedPage }
}

/**
 * Update specific schedule slot time
 */
const updateTaskSchedule = async (
   taskId,
   pageId,
   userId,
   { slotIndex, start, end }
) => {
   const task = await Task.findById(taskId)

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

   // Sync with Google Calendar if there's a google_event_id and times changed
   if (slot.google_event_id && (start !== oldStart || end !== oldEnd)) {
      const result = await syncTaskSlotWithGoogle(
         task._id,
         task.title,
         slot,
         slot.google_account_email,
         slot.google_calendar_id,
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

   task.schedule[slotIndex] = slot
   task.update_date = new Date()
   await task.save()

   // Get updated page data
   const page = await Page.findById(pageId)
      .populate('progress_order', [
         'title',
         'title_color',
         'color',
         'visibility'
      ])
      .populate('group_order', ['title', 'color', 'visibility'])
      .populate('tasks', ['title', 'schedule'])

   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   // Update page's update_date since task was modified
   page.update_date = new Date()
   await page.save()

   return { success: true, task, page }
}

/**
 * Add new schedule slot to task
 */
const addTaskScheduleSlot = async (taskId, pageId, { start, end }) => {
   const task = await Task.findById(taskId)

   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }

   if (!task.schedule) task.schedule = []

   const newSlot = { start, end }
   task.schedule.push(newSlot)
   task.update_date = new Date()

   await task.save()

   // Get updated page data
   const page = await Page.findById(pageId)
      .populate('progress_order', [
         'title',
         'title_color',
         'color',
         'visibility'
      ])
      .populate('group_order', ['title', 'color', 'visibility'])
      .populate('tasks', ['title', 'schedule'])

   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   // Update page's update_date since task was modified
   page.update_date = new Date()
   await page.save()

   return { success: true, task, page, newSlotIndex: task.schedule.length - 1 }
}

/**
 * Remove schedule slot from task
 */
const removeTaskScheduleSlot = async (
   taskId,
   pageId,
   userId,
   { slotIndex }
) => {
   const task = await Task.findById(taskId)

   if (!task) {
      return { success: false, message: 'Task not found', statusCode: 404 }
   }

   if (!task.schedule || slotIndex < 0 || slotIndex >= task.schedule.length) {
      return { success: false, message: 'Invalid slot index', statusCode: 400 }
   }

   const slotToRemove = task.schedule[slotIndex]

   // Delete Google event if exists
   if (slotToRemove.google_event_id) {
      await deleteGoogleEventsForRemovedSlots([slotToRemove], [], userId)
   }

   task.schedule.splice(slotIndex, 1)
   task.update_date = new Date()

   await task.save()

   // Get updated page data
   const page = await Page.findById(pageId)
      .populate('progress_order', [
         'title',
         'title_color',
         'color',
         'visibility'
      ])
      .populate('group_order', ['title', 'color', 'visibility'])
      .populate('tasks', ['title', 'schedule'])

   if (!page) {
      return { success: false, message: 'Page not found', statusCode: 404 }
   }

   // Update page's update_date since task was modified
   page.update_date = new Date()
   await page.save()

   return { success: true, task, page }
}

/**
 * Sync task slot with Google Calendar and update task data
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
      const task = await Task.findById(taskId)
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
         task.schedule[slotIndex].google_event_id = null
         task.schedule[slotIndex].google_account_email = null
         task.schedule[slotIndex].google_calendar_id = null
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
         task.schedule[slotIndex].google_event_id = result.event.id
         task.schedule[slotIndex].google_account_email = accountEmail
         task.schedule[slotIndex].google_calendar_id = calendarId
      }

      task.update_date = new Date()
      await task.save()

      // Get page to determine group and progress
      const page = await Page.findOne({ tasks: taskId })
         .populate('progress_order', [
            'title',
            'title_color',
            'color',
            'visibility'
         ])
         .populate('group_order', ['title', 'color', 'visibility'])
         .populate('tasks', ['title', 'schedule'])

      if (!page) {
         return { success: false, message: 'Page not found', statusCode: 404 }
      }

      return {
         success: true,
         task,
         page,
         event: result.event
      }
   } catch (err) {
      console.error('Error syncing task slot with Google:', err)
      return { success: false, error: err.message, statusCode: 500 }
   }
}

module.exports = {
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
