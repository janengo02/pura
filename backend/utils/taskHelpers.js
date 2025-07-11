const Task = require('../models/TaskModel')
const User = require('../models/UserModel')
const { google } = require('googleapis')
const { setOAuthCredentials } = require('./googleAccountHelper')

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
   accountId,
   calendarId,
   userId
) => {
   try {
      const user = await User.findById(userId)

      // Find the specified Google account
      const account = user.google_accounts.find(
         (acc) => acc._id.toString() === accountId
      )
      if (!account) {
         return { success: false, message: 'Google account not found' }
      }

      const oauth2Client = setOAuthCredentials(account.refresh_token)
      const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

      try {
         let event

         if (slot.google_event_id) {
            // Update existing event
            event = await calendar.events.update({
               calendarId: calendarId || 'primary',
               eventId: slot.google_event_id,
               requestBody: {
                  summary: taskTitle,
                  start: {
                     dateTime: new Date(slot.start).toISOString()
                  },
                  end: {
                     dateTime: new Date(slot.end).toISOString()
                  }
               }
            })
         } else {
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

         return { success: true, event: event.data }
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
         if (slot.google_event_id && slot.google_account_id) {
            if (!slotsByAccount[slot.google_account_id]) {
               slotsByAccount[slot.google_account_id] = []
            }
            slotsByAccount[slot.google_account_id].push(slot)
         }
      })

      // Delete Google events for each account
      for (const [accountId, slots] of Object.entries(slotsByAccount)) {
         const account = user.google_accounts.find(
            (acc) => acc._id.toString() === accountId
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
      s

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
module.exports = {
   getNewMap,
   deleteGoogleEventsForRemovedSlots,
   updateTaskFromGoogleEvent,
   syncTaskSlotWithGoogle
}
